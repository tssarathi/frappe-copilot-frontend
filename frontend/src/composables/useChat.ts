/** Message state machine with WebSocket streaming. */

import { ref, readonly } from "vue";
import { useWebSocket } from "./useWebSocket";
import { useAuth } from "./useAuth";
import { getPageContext } from "@/utils/context";
import type {
  Message,
  ContentBlock,
  ServerEvent,
  ConnectionState,
} from "@/types";

const VALID_BLOCK_TYPES = new Set(["text", "chart", "table", "kpi", "status_list"]);

function isValidBlock(block: Record<string, unknown>): boolean {
  return typeof block.type === "string" && VALID_BLOCK_TYPES.has(block.type);
}

export function useChat() {
  const messages = ref<Message[]>([]);
  const isStreaming = ref(false);

  const ws = useWebSocket();
  const auth = useAuth();

  let sessionId = "";
  let currentAssistantMsg: Message | null = null;

  ws.onMessage((data: unknown) => {
    const event = data as ServerEvent;
    _handleEvent(event);
  });

  function _handleEvent(event: ServerEvent): void {
    switch (event.type) {
      case "ack":
        break;

      case "token":
        _ensureAssistantMessage();
        currentAssistantMsg!.content += event.content;
        _triggerReactivity();
        break;

      case "content_block":
        _ensureAssistantMessage();
        if (!currentAssistantMsg!.blocks) {
          currentAssistantMsg!.blocks = [];
        }
        if (isValidBlock(event.block)) {
          currentAssistantMsg!.blocks.push(event.block as ContentBlock);
        }
        _triggerReactivity();
        break;

      case "tool_start":
        messages.value.push({
          id: event.call_id,
          role: "tool_call",
          content: "",
          toolCall: {
            call_id: event.call_id,
            name: event.name,
            arguments: event.arguments,
            status: "running",
          },
          timestamp: new Date(),
        });
        break;

      case "tool_end": {
        const toolMsg = messages.value.find(
          (m) => m.toolCall?.call_id === event.call_id,
        );
        if (toolMsg?.toolCall) {
          toolMsg.toolCall.result = event.result;
          toolMsg.toolCall.success = event.success;
          toolMsg.toolCall.status = event.success ? "done" : "error";
          _triggerReactivity();
        }
        break;
      }

      case "error":
        messages.value.push({
          id: crypto.randomUUID(),
          role: "error",
          content: event.message,
          error: {
            code: event.code,
            message: event.message,
            suggestion: event.suggestion,
          },
          timestamp: new Date(),
        });
        isStreaming.value = false;
        currentAssistantMsg = null;
        break;

      case "done":
        isStreaming.value = false;
        currentAssistantMsg = null;
        break;
    }
  }

  function _ensureAssistantMessage(): void {
    if (!currentAssistantMsg) {
      currentAssistantMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        blocks: [],
        timestamp: new Date(),
      };
      messages.value.push(currentAssistantMsg);
    }
  }

  function _triggerReactivity(): void {
    messages.value = [...messages.value];
  }

  function connect(agentUrl: string): void {
    const base = agentUrl.replace(/\/$/, "");
    ws.connect(async () => {
      const token = await auth.fetchToken();
      return base + "/ws/chat?token=" + token;
    });
    sessionId = crypto.randomUUID();
  }

  function disconnect(): void {
    ws.disconnect();
    isStreaming.value = false;
    currentAssistantMsg = null;
  }

  function sendMessage(content: string): void {
    messages.value.push({
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    });

    isStreaming.value = true;
    currentAssistantMsg = null;

    ws.send({
      type: "chat",
      content,
      context: getPageContext(),
      session_id: sessionId,
      request_id: crypto.randomUUID(),
    });
  }

  function clearMessages(): void {
    messages.value = [];
    sessionId = crypto.randomUUID();
    isStreaming.value = false;
    currentAssistantMsg = null;
  }

  return {
    messages: readonly(messages),
    isStreaming: readonly(isStreaming),
    connectionState: ws.state as Readonly<{ value: ConnectionState }>,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
  };
}

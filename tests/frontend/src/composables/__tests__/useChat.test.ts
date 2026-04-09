import { describe, it, expect, vi, beforeEach } from "vitest";
import { useChat } from "@/composables/useChat";

const mockConnect = vi.fn();
const mockDisconnect = vi.fn();
const mockSend = vi.fn();
let capturedHandler: ((data: unknown) => void) | null = null;

vi.mock("@/composables/useWebSocket", () => ({
  useWebSocket: () => ({
    state: { value: "connected" },
    connect: mockConnect,
    disconnect: mockDisconnect,
    send: mockSend,
    onMessage: (handler: (data: unknown) => void) => {
      capturedHandler = handler;
    },
  }),
}));

vi.mock("@/composables/useAuth", () => ({
  useAuth: () => ({
    token: { value: "test-jwt-token" },
    fetchToken: vi.fn().mockResolvedValue("test-jwt-token"),
    clearToken: vi.fn(),
  }),
}));

vi.stubGlobal("crypto", { randomUUID: () => "test-uuid-1234" });

describe("useChat", () => {
  beforeEach(() => {
    mockConnect.mockClear();
    mockDisconnect.mockClear();
    mockSend.mockClear();
    capturedHandler = null;
  });

  it("starts with empty messages", () => {
    const { messages } = useChat();
    expect(messages.value).toEqual([]);
  });

  it("connect calls useWebSocket connect with token in URL", async () => {
    const { connect } = useChat();
    await connect("ws://localhost:8484");
    expect(mockConnect).toHaveBeenCalledWith(
      "ws://localhost:8484/ws/chat?token=test-jwt-token",
    );
  });

  it("sendMessage adds user message and sends via WebSocket", async () => {
    const { messages, connect, sendMessage } = useChat();
    await connect("ws://localhost:8484");
    sendMessage("Hello");

    expect(messages.value.length).toBe(1);
    expect(messages.value[0].role).toBe("user");
    expect(messages.value[0].content).toBe("Hello");
    expect(mockSend).toHaveBeenCalled();
  });

  it("handles token events by building assistant message", async () => {
    const { messages, connect, sendMessage } = useChat();
    await connect("ws://localhost:8484");
    sendMessage("Hello");

    capturedHandler?.({ type: "ack", request_id: "r1", session_id: "s1" });
    capturedHandler?.({ type: "token", content: "Hi " });
    capturedHandler?.({ type: "token", content: "there!" });

    expect(messages.value.length).toBe(2);
    expect(messages.value[1].role).toBe("assistant");
    expect(messages.value[1].content).toBe("Hi there!");
  });

  it("handles content_block events", async () => {
    const { messages, connect, sendMessage } = useChat();
    await connect("ws://localhost:8484");
    sendMessage("Show chart");

    capturedHandler?.({ type: "ack", request_id: "r1", session_id: "s1" });
    capturedHandler?.({
      type: "content_block",
      block: { type: "text", content: "Here is data" },
    });
    capturedHandler?.({ type: "done", request_id: "r1" });

    expect(messages.value[1].blocks?.length).toBe(1);
    expect(messages.value[1].blocks?.[0].type).toBe("text");
  });

  it("handles tool_start and tool_end events", async () => {
    const { messages, connect, sendMessage } = useChat();
    await connect("ws://localhost:8484");
    sendMessage("Get data");

    capturedHandler?.({ type: "ack", request_id: "r1", session_id: "s1" });
    capturedHandler?.({
      type: "tool_start",
      call_id: "tc1",
      name: "get_sales",
      arguments: { limit: 10 },
    });

    const toolMsg = messages.value.find((m) => m.role === "tool_call");
    expect(toolMsg).toBeDefined();
    expect(toolMsg?.toolCall?.name).toBe("get_sales");
    expect(toolMsg?.toolCall?.status).toBe("running");

    capturedHandler?.({
      type: "tool_end",
      call_id: "tc1",
      result: '{"total": 42}',
      success: true,
    });

    expect(toolMsg?.toolCall?.status).toBe("done");
    expect(toolMsg?.toolCall?.result).toBe('{"total": 42}');
  });

  it("handles error events", async () => {
    const { messages, connect, sendMessage } = useChat();
    await connect("ws://localhost:8484");
    sendMessage("Bad request");

    capturedHandler?.({
      type: "error",
      code: "RATE_LIMITED",
      message: "Too many requests",
      suggestion: "Please wait",
    });

    const errorMsg = messages.value.find((m) => m.role === "error");
    expect(errorMsg).toBeDefined();
    expect(errorMsg?.error?.code).toBe("RATE_LIMITED");
    expect(errorMsg?.error?.suggestion).toBe("Please wait");
  });

  it("clears messages", async () => {
    const { messages, connect, sendMessage, clearMessages } = useChat();
    await connect("ws://localhost:8484");
    sendMessage("Hello");
    expect(messages.value.length).toBe(1);

    clearMessages();
    expect(messages.value.length).toBe(0);
  });

  it("sets isStreaming during active response", async () => {
    const { isStreaming, connect, sendMessage } = useChat();
    await connect("ws://localhost:8484");
    sendMessage("Hello");

    expect(isStreaming.value).toBe(true);

    capturedHandler?.({ type: "ack", request_id: "r1", session_id: "s1" });
    capturedHandler?.({ type: "done", request_id: "r1" });

    expect(isStreaming.value).toBe(false);
  });
});

/**
 * WebSocket Protocol v2 event types.
 * Mirrors copilot_agent/schemas.py exactly.
 */

export interface ChatMessagePayload {
  type: "chat";
  content: string;
  context: Record<string, unknown>;
  session_id: string;
  request_id: string;
}

export interface AckEvent {
  type: "ack";
  request_id: string;
  session_id: string;
}

export interface ToolStartEvent {
  type: "tool_start";
  call_id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolEndEvent {
  type: "tool_end";
  call_id: string;
  result: string;
  success: boolean;
}

export interface ContentBlockEvent {
  type: "content_block";
  block: Record<string, unknown>;
}

export interface TokenEvent {
  type: "token";
  content: string;
}

export interface ErrorEvent {
  type: "error";
  code: string;
  message: string;
  suggestion?: string;
  request_id?: string;
}

export interface DoneEvent {
  type: "done";
  request_id: string;
  usage?: Record<string, number>;
}

export type ServerEvent =
  | AckEvent
  | ToolStartEvent
  | ToolEndEvent
  | ContentBlockEvent
  | TokenEvent
  | ErrorEvent
  | DoneEvent;

export type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

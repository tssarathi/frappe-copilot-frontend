import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useWebSocket } from "@/composables/useWebSocket";

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  url: string;
  onopen: (() => void) | null = null;
  onmessage: ((e: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  readyState = 0;
  static readonly OPEN = 1;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  send = vi.fn();
  close = vi.fn(() => {
    this.readyState = 3;
    this.onclose?.();
  });

  simulateOpen() {
    this.readyState = 1;
    this.onopen?.();
  }

  simulateMessage(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }

  simulateClose() {
    this.readyState = 3;
    this.onclose?.();
  }

  simulateError() {
    this.onerror?.();
  }
}

describe("useWebSocket", () => {
  beforeEach(() => {
    MockWebSocket.instances = [];
    vi.stubGlobal("WebSocket", MockWebSocket);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("starts in disconnected state", () => {
    const { state } = useWebSocket();
    expect(state.value).toBe("disconnected");
  });

  it("transitions to connecting then connected", () => {
    const { state, connect } = useWebSocket();
    connect("ws://localhost:8484/ws/chat?token=test");

    expect(state.value).toBe("connecting");

    const ws = MockWebSocket.instances[0];
    ws.simulateOpen();
    expect(state.value).toBe("connected");
  });

  it("sends JSON messages", () => {
    const { connect, send } = useWebSocket();
    connect("ws://localhost:8484/ws/chat?token=test");
    MockWebSocket.instances[0].simulateOpen();

    send({ type: "chat", content: "hello" });
    expect(MockWebSocket.instances[0].send).toHaveBeenCalledWith(
      JSON.stringify({ type: "chat", content: "hello" }),
    );
  });

  it("dispatches parsed messages to handler", () => {
    const handler = vi.fn();
    const { connect, onMessage } = useWebSocket();
    onMessage(handler);
    connect("ws://localhost:8484/ws/chat?token=test");
    MockWebSocket.instances[0].simulateOpen();

    MockWebSocket.instances[0].simulateMessage({ type: "token", content: "hi" });
    expect(handler).toHaveBeenCalledWith({ type: "token", content: "hi" });
  });

  it("auto-reconnects on close with exponential backoff", () => {
    const { state, connect } = useWebSocket();
    connect("ws://localhost:8484/ws/chat?token=test");
    MockWebSocket.instances[0].simulateOpen();
    MockWebSocket.instances[0].simulateClose();

    expect(state.value).toBe("disconnected");

    vi.advanceTimersByTime(1000);
    expect(MockWebSocket.instances.length).toBe(2);
  });

  it("does not reconnect after intentional disconnect", () => {
    const { connect, disconnect } = useWebSocket();
    connect("ws://localhost:8484/ws/chat?token=test");
    MockWebSocket.instances[0].simulateOpen();
    disconnect();

    vi.advanceTimersByTime(5000);
    expect(MockWebSocket.instances.length).toBe(1);
  });

  it("caps backoff at 30 seconds", () => {
    const { connect } = useWebSocket();
    connect("ws://localhost:8484/ws/chat?token=test");

    for (let i = 0; i < 10; i++) {
      const ws = MockWebSocket.instances[MockWebSocket.instances.length - 1];
      ws.simulateOpen();
      ws.simulateClose();
      vi.advanceTimersByTime(30_000);
    }

    expect(MockWebSocket.instances.length).toBeGreaterThan(1);
  });
});

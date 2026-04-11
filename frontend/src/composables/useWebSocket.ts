/** Reactive WebSocket with auto-reconnect and exponential backoff. */

import { ref, readonly } from "vue";
import type { ConnectionState } from "@/types";

const MAX_BACKOFF_MS = 30_000;
const INITIAL_BACKOFF_MS = 1_000;

export function useWebSocket() {
  const state = ref<ConnectionState>("disconnected");

  let socket: WebSocket | null = null;
  let urlFactory: (() => string | Promise<string>) | null = null;
  let intentionalClose = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let backoffMs = INITIAL_BACKOFF_MS;
  let messageHandler: ((data: unknown) => void) | null = null;

  /** Connect using a URL factory. The factory is called on every (re)connect
   *  attempt so it can return a fresh token each time. */
  function connect(factory: () => string | Promise<string>): void {
    urlFactory = factory;
    intentionalClose = false;
    backoffMs = INITIAL_BACKOFF_MS;
    _createSocket();
  }

  function disconnect(): void {
    intentionalClose = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    socket?.close();
    socket = null;
    state.value = "disconnected";
  }

  function send(data: unknown): void {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(typeof data === "string" ? data : JSON.stringify(data));
    }
  }

  function onMessage(handler: (data: unknown) => void): void {
    messageHandler = handler;
  }

  function _createSocket(): void {
    if (!urlFactory) return;
    state.value = "connecting";
    Promise.resolve(urlFactory()).then((wsUrl) => {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        state.value = "connected";
        backoffMs = INITIAL_BACKOFF_MS;
      };

      socket.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          messageHandler?.(data);
        } catch {
          messageHandler?.(event.data);
        }
      };

      socket.onerror = () => {
        state.value = "error";
      };

      socket.onclose = () => {
        state.value = "disconnected";
        socket = null;
        if (!intentionalClose) {
          _scheduleReconnect();
        }
      };
    });
  }

  function _scheduleReconnect(): void {
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      _createSocket(); // calls urlFactory() again → refreshes token if expired
    }, backoffMs);
    backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS);
  }

  return {
    state: readonly(state),
    connect,
    disconnect,
    send,
    onMessage,
  };
}

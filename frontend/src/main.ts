/** Bootstrap: load settings, mount sidebar app, wire keyboard shortcut. */

import { createApp } from "vue";
import App from "./App.vue";

declare const frappe: any;

interface CopilotState {
  enabled: boolean;
  agentUrl: string;
  sidebarWidth: number;
  keyboardShortcut: string;
  ready: boolean;
}

const state: CopilotState = {
  enabled: false,
  agentUrl: "ws://localhost:8484",
  sidebarWidth: 380,
  keyboardShortcut: "Ctrl+/",
  ready: false,
};

async function bootstrap(): Promise<void> {
  try {
    const result = await frappe.call({
      method: "frappe_copilot.api.get_settings",
      async: true,
    });
    if (result?.message) {
      state.enabled = result.message.enabled;
      state.agentUrl = result.message.agent_url;
      state.sidebarWidth = result.message.sidebar_width;
      state.keyboardShortcut = result.message.keyboard_shortcut;
    }
  } catch (e) {
    console.warn("[Copilot] Failed to load settings:", e);
    return;
  }

  if (!state.enabled) return;

  const root = document.createElement("div");
  root.id = "copilot-sidebar-root";
  document.body.appendChild(root);

  const app = createApp(App, {
    agentUrl: state.agentUrl,
    sidebarWidth: state.sidebarWidth,
    keyboardShortcut: state.keyboardShortcut,
  });
  app.mount(root);

  addNavbarButton();
  registerShortcut(state.keyboardShortcut);

  document.addEventListener("copilot-opened", () => {
    document.querySelector(".main-section")?.classList.add("copilot-push");
  });
  document.addEventListener("copilot-closed", () => {
    document.querySelector(".main-section")?.classList.remove("copilot-push");
  });

  state.ready = true;
}

function addNavbarButton(): void {
  const navbar =
    document.querySelector(".navbar-right") ||
    document.querySelector(".navbar-nav:last-child");
  if (!navbar) return;

  const li = document.createElement("li");
  li.className = "nav-item";
  li.innerHTML = `
    <a class="nav-link copilot-nav-btn" title="Toggle Copilot">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </a>`;
  li.querySelector("a")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.dispatchEvent(new CustomEvent("copilot-toggle"));
  });
  navbar.appendChild(li);
}

function registerShortcut(shortcut: string): void {
  const parts = shortcut
    .toLowerCase()
    .split("+")
    .map((s) => s.trim());
  const key = parts.pop() || "";
  const ctrl = parts.includes("ctrl") || parts.includes("cmd");
  const shift = parts.includes("shift");
  const alt = parts.includes("alt");

  document.addEventListener("keydown", (e: KeyboardEvent) => {
    const matchKey = e.key === key || (e.key === "/" && key === "/");
    if (matchKey && e.ctrlKey === ctrl && e.shiftKey === shift && e.altKey === alt) {
      e.preventDefault();
      document.dispatchEvent(new CustomEvent("copilot-toggle"));
    }
  });
}

if (typeof frappe !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
}

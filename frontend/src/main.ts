/** Bootstrap: load settings, mount sidebar app, inject navbar button and sidebar item. */

import { createApp } from "vue";
import App from "./App.vue";

declare const frappe: any;
declare const $: any;
declare function __(...args: any[]): string;

const CONTAINER_ID = "copilot-sidebar-root";

const state = {
  enabled: false,
  agentUrl: "ws://localhost:8484",
  sidebarWidth: 380,
  keyboardShortcut: "Ctrl+/",
  ready: false,
};

async function loadSettings(): Promise<void> {
  try {
    const settings = await new Promise<any>((resolve, reject) => {
      frappe.call({
        method: "frappe_copilot.api.get_settings",
        callback: (r: any) => resolve(r.message),
        error: reject,
      });
    });
    if (settings) {
      state.enabled = Boolean(settings.enabled);
      state.agentUrl = settings.agent_url || "ws://localhost:8484";
      state.sidebarWidth = settings.sidebar_width || 380;
      state.keyboardShortcut = settings.keyboard_shortcut || "Ctrl+/";
    }
  } catch (err) {
    console.warn("[Frappe Copilot] Could not load settings:", err);
  }
  state.ready = true;
}

function mountApp(): void {
  if (document.getElementById(CONTAINER_ID)) return;
  const container = document.createElement("div");
  container.id = CONTAINER_ID;
  document.body.appendChild(container);
  createApp(App, {
    agentUrl: state.agentUrl,
    sidebarWidth: state.sidebarWidth,
    keyboardShortcut: state.keyboardShortcut,
  }).mount(container);
}

/**
 * Inject toggle button into the ERPNext v16 desktop navbar.
 * Targets .desktop-navbar .desktop-notifications (the bell icon),
 * inserts before it in the right-side flex container.
 */
function addNavbarToggle(): void {
  const interval = setInterval(() => {
    if (document.getElementById("copilot-toggle-btn")) {
      clearInterval(interval);
      return;
    }
    const navNotifications = document.querySelector(".desktop-navbar .desktop-notifications");
    if (!navNotifications) return;
    clearInterval(interval);

    const rightContainer = navNotifications.parentElement!;
    const btn = document.createElement("button");
    btn.id = "copilot-toggle-btn";
    btn.className = "btn-reset nav-link text-muted";
    btn.title = `Copilot (${state.keyboardShortcut})`;
    btn.innerHTML = frappe.utils.icon("message-square-text", "sm");
    btn.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("copilot-toggle"));
    });
    rightContainer.insertBefore(btn, navNotifications);
  }, 100);
  setTimeout(() => clearInterval(interval), 10000);
}

/** Add "Copilot" item to the Frappe left sidebar. */
function addSidebarItem(): void {
  const interval = setInterval(() => {
    const sidebar = frappe.app?.sidebar;
    if (!sidebar?.$standard_items_sections?.length) return;
    if (!sidebar.standard_items_setup) return;
    clearInterval(interval);
    if (sidebar.$standard_items_sections.find('[item-name="Copilot"]').length) return;
    sidebar.add_item(sidebar.$standard_items_sections, {
      label: __("Copilot"),
      icon: "message-square-text",
      standard: true,
      type: "Button",
      class: "copilot-toggle",
      onClick: () => {
        document.dispatchEvent(new CustomEvent("copilot-toggle"));
      },
    });
  }, 100);
  setTimeout(() => clearInterval(interval), 10000);
}

function measureNavbarHeight(): void {
  const navbar = document.querySelector("header.desktop-navbar");
  if (navbar) {
    document.documentElement.style.setProperty(
      "--copilot-navbar-height",
      (navbar as HTMLElement).offsetHeight + "px",
    );
  }
}

/**
 * Push layout: shift .main-section right when the sidebar opens
 * so ERPNext content is not covered. Uses CSS variables set on <html>.
 */
function setupPushLayout(): void {
  measureNavbarHeight();
  document.addEventListener("copilot-opened", () => {
    if (window.innerWidth >= 768) {
      measureNavbarHeight();
      document.documentElement.style.setProperty("--copilot-push", state.sidebarWidth + "px");
    }
  });
  document.addEventListener("copilot-closed", () => {
    document.documentElement.style.setProperty("--copilot-push", "0px");
  });
}

function bootstrap(): void {
  // Dev mode — no frappe global, mount immediately
  if (typeof frappe === "undefined") {
    state.enabled = true;
    state.ready = true;
    mountApp();
    return;
  }

  function init() {
    loadSettings().then(() => {
      if (state.enabled) {
        mountApp();
        setupPushLayout();
        addNavbarToggle();
        addSidebarItem();
      }
    });
  }

  if (frappe.app) {
    init();
  } else {
    $(document).on("app_ready", init);
  }
}

bootstrap();

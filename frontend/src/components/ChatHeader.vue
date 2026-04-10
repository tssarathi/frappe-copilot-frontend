<script setup lang="ts">
import type { ConnectionState } from "@/types/websocket";

defineProps<{
  connectionState: ConnectionState;
}>();

const emit = defineEmits<{
  clear: [];
  close: [];
}>();

/** Render a Frappe Lucide icon; falls back to inline SVG in dev mode. */
function frappeIcon(name: string, size: string): string {
  if (typeof frappe !== "undefined" && frappe.utils?.icon) {
    return frappe.utils.icon(name, size);
  }
  return `<svg class="icon icon-${size}"><use href="#icon-${name}"></use></svg>`;
}

declare const frappe: any;
</script>

<template>
  <div class="copilot-header">
    <div class="copilot-header-left">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span v-html="frappeIcon('message-square-text', 'sm')" />
      <span class="copilot-header-title">Copilot</span>
      <span
        :class="[
          'copilot-indicator',
          connectionState === 'connected' ? 'copilot-indicator--connected' :
          connectionState === 'connecting' ? 'copilot-indicator--connecting' :
          connectionState === 'error' ? 'copilot-indicator--error' :
          'copilot-indicator--offline',
        ]"
      >
        <span class="copilot-indicator-dot" />
        {{
          connectionState === 'connected' ? 'Connected' :
          connectionState === 'connecting' ? 'Connecting' :
          connectionState === 'error' ? 'Error' : 'Offline'
        }}
      </span>
    </div>
    <div class="copilot-header-actions">
      <button class="copilot-icon-btn" title="New conversation" @click="emit('clear')">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="frappeIcon('rotate-ccw', 'sm')" />
      </button>
      <button class="copilot-icon-btn" title="Close sidebar" @click="emit('close')">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="frappeIcon('x', 'sm')" />
      </button>
    </div>
  </div>
</template>

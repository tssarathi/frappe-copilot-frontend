<script setup lang="ts">
import ConnectionStatus from "./ConnectionStatus.vue";
import type { ConnectionState } from "@/types/websocket";

defineProps<{
  connectionState: ConnectionState;
}>();

const emit = defineEmits<{
  clear: [];
  close: [];
}>();
</script>

<template>
  <div class="copilot-header">
    <div class="copilot-header-left">
      <span class="copilot-header-title">Copilot</span>
      <ConnectionStatus :state="connectionState" />
    </div>
    <div class="copilot-header-actions">
      <button class="copilot-header-btn" title="Clear chat" @click="emit('clear')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="1 4 1 10 7 10"></polyline>
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
        </svg>
      </button>
      <button class="copilot-header-btn" title="Close" @click="emit('close')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </div>
</template>

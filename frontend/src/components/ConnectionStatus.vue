<script setup lang="ts">
import type { ConnectionState } from "@/types/websocket";

const props = defineProps<{ state: ConnectionState }>();

const labels: Record<ConnectionState, string> = {
  connected: "Connected",
  connecting: "Connecting",
  disconnected: "Disconnected",
  error: "Error",
};
</script>

<template>
  <div class="copilot-conn" :class="`copilot-conn--${state}`" :title="labels[state]">
    <span class="copilot-conn-dot"></span>
  </div>
</template>

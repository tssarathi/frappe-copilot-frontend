<script setup lang="ts">
import { ref } from "vue";
import type { ToolCall } from "@/types/messages";

const props = defineProps<{ toolCall: ToolCall }>();
const expanded = ref(false);

function formatTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
</script>

<template>
  <div class="copilot-tool-card">
    <div class="copilot-tool-header">
      <span :class="`copilot-tool-status copilot-tool-status--${toolCall.status}`"></span>
      <span class="copilot-tool-name">{{ toolCall.name }}</span>
      <span class="copilot-tool-time">{{ formatTime() }}</span>
    </div>
    <div v-if="Object.keys(toolCall.arguments).length > 0" class="copilot-tool-args">
      <pre>{{ JSON.stringify(toolCall.arguments, null, 2) }}</pre>
    </div>
    <div v-if="toolCall.result" class="copilot-tool-result">
      <button class="copilot-tool-toggle" @click="expanded = !expanded">
        <span :class="{ 'copilot-chevron-open': expanded }">&#9656;</span>
        Result
      </button>
      <div v-if="expanded" class="copilot-tool-result-body">
        <pre>{{ toolCall.result }}</pre>
      </div>
    </div>
  </div>
</template>

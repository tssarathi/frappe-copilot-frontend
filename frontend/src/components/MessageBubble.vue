<script setup lang="ts">
import { computed } from "vue";
import { getBlockComponent } from "./blocks";
import type { Message } from "@/types/messages";

const props = defineProps<{ message: Message }>();

const CRITICAL_CODES = ["AUTH_FAILURE", "ERPNEXT_DOWN"];
const WARNING_CODES = ["MCP_UNREACHABLE"];

const errorSeverity = computed(() => {
  if (props.message.role !== "error" || !props.message.error) return "";
  const code = props.message.error.code.toUpperCase();
  if (CRITICAL_CODES.includes(code)) return "critical";
  if (WARNING_CODES.includes(code)) return "warning";
  return "info";
});

const timeStr = computed(() =>
  props.message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
);
</script>

<template>
  <div :class="`copilot-bubble copilot-bubble--${message.role}`">
    <!-- User message -->
    <div v-if="message.role === 'user'" class="copilot-bubble-content">
      {{ message.content }}
    </div>

    <!-- Assistant message -->
    <div v-else-if="message.role === 'assistant'" class="copilot-bubble-content">
      <template v-if="message.blocks && message.blocks.length > 0">
        <component
          v-for="(block, i) in message.blocks"
          :key="i"
          :is="getBlockComponent(block.type)"
          :block="block"
        />
      </template>
      <div v-else-if="message.content" class="copilot-text-content">
        {{ message.content }}
      </div>
    </div>

    <!-- Error message -->
    <div
      v-else-if="message.role === 'error'"
      :class="`copilot-error copilot-error--${errorSeverity}`"
    >
      <div class="copilot-error-message">{{ message.error?.message }}</div>
      <div v-if="message.error?.suggestion" class="copilot-error-suggestion">
        {{ message.error.suggestion }}
      </div>
    </div>

    <div class="copilot-bubble-time">{{ timeStr }}</div>
  </div>
</template>

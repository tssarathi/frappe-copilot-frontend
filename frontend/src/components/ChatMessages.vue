<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import MessageBubble from "./MessageBubble.vue";
import ToolCallCard from "./ToolCallCard.vue";
import type { Message } from "@/types/messages";

declare const frappe: any;

function frappeIcon(name: string, size: string): string {
  if (typeof frappe !== "undefined" && frappe.utils?.icon) {
    return frappe.utils.icon(name, size);
  }
  return `<svg class="icon icon-${size}"><use href="#icon-${name}"></use></svg>`;
}

const props = defineProps<{
  messages: readonly Message[];
  isStreaming: boolean;
}>();

const container = ref<HTMLElement>();

watch(
  () => props.messages,
  () => {
    nextTick(() => {
      if (container.value) {
        container.value.scrollTop = container.value.scrollHeight;
      }
    });
  },
  { deep: true },
);
</script>

<template>
  <div ref="container" class="copilot-messages">
    <div v-if="messages.length === 0" class="copilot-empty-state">
      <div class="copilot-empty-icon">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="frappeIcon('bot-message-square', 'md')" />
      </div>
      <p class="copilot-empty-title">How can I help?</p>
      <p class="copilot-empty-subtitle">
        Ask me anything about your ERPNext data, or let me help you with tasks.
      </p>
    </div>

    <template v-for="msg in messages" :key="msg.id">
      <ToolCallCard
        v-if="msg.role === 'tool_call' && msg.toolCall"
        :tool-call="msg.toolCall"
      />
      <MessageBubble v-else :message="msg" />
    </template>

    <div v-if="isStreaming" class="copilot-streaming">
      <span class="copilot-streaming-dot"></span>
      <span class="copilot-streaming-dot"></span>
      <span class="copilot-streaming-dot"></span>
    </div>
  </div>
</template>

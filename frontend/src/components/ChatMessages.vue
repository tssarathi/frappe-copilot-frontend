<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import MessageBubble from "./MessageBubble.vue";
import ToolCallCard from "./ToolCallCard.vue";
import type { Message } from "@/types/messages";

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
    <div v-if="messages.length === 0" class="copilot-empty">
      <div class="copilot-empty-icon">&#10024;</div>
      <div class="copilot-empty-text">Ask me anything about your ERPNext data</div>
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

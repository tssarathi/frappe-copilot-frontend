<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useChat } from "@/composables/useChat";
import ChatHeader from "./ChatHeader.vue";
import ChatMessages from "./ChatMessages.vue";
import ChatInput from "./ChatInput.vue";

const props = defineProps<{
  agentUrl: string;
  sidebarWidth: number;
  keyboardShortcut: string;
  visible: boolean;
}>();

const emit = defineEmits<{ close: [] }>();

const { messages, isStreaming, connectionState, connect, disconnect, sendMessage, clearMessages } =
  useChat();

function handleSend(content: string) {
  sendMessage(content);
}

function handleClear() {
  clearMessages();
}

function handleClose() {
  emit("close");
}

onMounted(() => {
  connect(props.agentUrl);
});

onUnmounted(() => {
  disconnect();
});
</script>

<template>
  <div
    v-if="visible"
    class="copilot-sidebar"
    :style="{ width: sidebarWidth + 'px' }"
  >
    <ChatHeader
      :connection-state="connectionState"
      @clear="handleClear"
      @close="handleClose"
    />
    <ChatMessages :messages="messages" :is-streaming="isStreaming" />
    <ChatInput
      :disabled="connectionState !== 'connected'"
      @send="handleSend"
    />
  </div>
</template>

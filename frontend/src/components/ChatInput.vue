<script setup lang="ts">
import { ref, nextTick } from "vue";

const props = defineProps<{ disabled: boolean }>();
const emit = defineEmits<{ send: [content: string] }>();

const content = ref("");
const textarea = ref<HTMLTextAreaElement>();

function handleSend() {
  const text = content.value.trim();
  if (!text) return;
  emit("send", text);
  content.value = "";
  nextTick(() => autoResize());
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
}

function autoResize() {
  const el = textarea.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 160) + "px";
}
</script>

<template>
  <div class="copilot-input">
    <textarea
      ref="textarea"
      v-model="content"
      :placeholder="disabled ? 'Connecting to agent...' : 'Ask anything...'"
      :disabled="disabled"
      rows="1"
      @keydown="handleKeydown"
      @input="autoResize"
    ></textarea>
    <button class="copilot-send-btn" :disabled="disabled || !content.trim()" @click="handleSend">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    </button>
  </div>
</template>

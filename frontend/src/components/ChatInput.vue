<template>
  <div class="copilot-input-area">
    <div class="copilot-input-row">
      <div class="copilot-input-wrapper">
        <textarea
          ref="inputEl"
          v-model="text"
          :disabled="disabled"
          class="copilot-textarea"
          rows="1"
          placeholder="Ask anything..."
          @keydown="handleKeydown"
          @input="autoResize"
        />
      </div>
      <button
        :disabled="disabled || !text.trim()"
        :class="['copilot-send-btn', text.trim() ? 'copilot-send-btn--active' : '']"
        title="Send message"
        @click="send"
      >
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="frappeIcon('send-horizontal', 'sm')" />
      </button>
    </div>
    <p v-if="disabled" class="copilot-input-hint">Connecting to agent...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";

declare const frappe: any;

defineProps<{ disabled: boolean }>();
const emit = defineEmits<{ send: [content: string] }>();

const text = ref("");
const inputEl = ref<HTMLTextAreaElement>();

function frappeIcon(name: string, size: string): string {
  if (typeof frappe !== "undefined" && frappe.utils?.icon) {
    return frappe.utils.icon(name, size);
  }
  return `<svg class="icon icon-${size}"><use href="#icon-${name}"></use></svg>`;
}

function send() {
  const content = text.value.trim();
  if (!content) return;
  emit("send", content);
  text.value = "";
  nextTick(() => {
    if (inputEl.value) inputEl.value.style.height = "auto";
  });
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
}

function autoResize() {
  const el = inputEl.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 160) + "px";
}
</script>

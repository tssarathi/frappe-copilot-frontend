<template>
  <div class="copilot-tool-card">
    <button
      :class="['copilot-tool-header', expanded ? 'copilot-tool-header--open' : '']"
      @click="expanded = !expanded"
    >
      <span class="copilot-tool-status" :class="`copilot-tool-status--${toolCall.status || 'running'}`" />
      <span class="copilot-tool-name">{{ toolCall.name }}</span>
      <span class="copilot-tool-time">{{ formattedTime }}</span>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span class="copilot-tool-chevron" v-html="frappeIcon('chevron-right', 'xs')" />
    </button>
    <div v-if="expanded">
      <div class="copilot-tool-section">
        <p class="copilot-tool-label">Arguments</p>
        <pre class="copilot-tool-pre">{{ formattedArgs }}</pre>
      </div>
      <div v-if="toolCall.result !== null && toolCall.result !== undefined">
        <button
          :class="['copilot-tool-expand-btn', resultExpanded ? 'copilot-tool-expand-btn--open' : '']"
          @click.stop="resultExpanded = !resultExpanded"
        >
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-html="frappeIcon('chevron-right', 'xs')" />
          Result
        </button>
        <div v-if="resultExpanded">
          <pre class="copilot-tool-result-pre">{{ formattedResult }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { ToolCall } from "@/types/messages";

declare const frappe: any;

const props = defineProps<{ toolCall: ToolCall }>();
const expanded = ref(false);
const resultExpanded = ref(false);

function frappeIcon(name: string, size: string): string {
  if (typeof frappe !== "undefined" && frappe.utils?.icon) {
    return frappe.utils.icon(name, size);
  }
  return `<svg class="icon icon-${size}"><use href="#icon-${name}"></use></svg>`;
}

const formattedArgs = computed(() => {
  if (!props.toolCall.arguments) return "{}";
  if (typeof props.toolCall.arguments === "string") return props.toolCall.arguments;
  try {
    return JSON.stringify(props.toolCall.arguments, null, 2);
  } catch {
    return String(props.toolCall.arguments);
  }
});

const formattedResult = computed(() => {
  const r = props.toolCall.result;
  if (r === null || r === undefined) return "";
  if (typeof r === "string") return r;
  try {
    return JSON.stringify(r, null, 2);
  } catch {
    return String(r);
  }
});

const formattedTime = computed(() =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
);
</script>

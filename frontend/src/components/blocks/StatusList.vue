<script setup lang="ts">
import type { StatusListBlock, StatusItem } from "@/types/blocks";

declare const frappe: any;

const props = defineProps<{ block: StatusListBlock }>();

function navigate(item: StatusItem) {
  if (item.route) {
    frappe.set_route("Form", item.route.doctype, item.route.name);
  }
}
</script>

<template>
  <div class="copilot-status-list">
    <div v-if="block.title" class="copilot-status-title">{{ block.title }}</div>
    <div v-for="(item, i) in block.items" :key="i"
         class="copilot-status-item"
         :class="{ 'copilot-status-clickable': !!item.route }"
         @click="navigate(item)">
      <span :class="`copilot-status-dot copilot-status-dot--${item.color}`"></span>
      <span class="copilot-status-label">{{ item.label }}</span>
      <span :class="`copilot-status-badge copilot-status-badge--${item.color}`">{{ item.status }}</span>
    </div>
  </div>
</template>

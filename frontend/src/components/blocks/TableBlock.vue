<script setup lang="ts">
import { ref, computed } from "vue";
import { formatValue } from "@/utils/formatters";
import type { TableBlock, TableRow } from "@/types/blocks";

declare const frappe: any;

const props = defineProps<{ block: TableBlock }>();

const sortKey = ref("");
const sortAsc = ref(true);

const sortedRows = computed(() => {
  if (!sortKey.value) return props.block.rows;
  const col = props.block.columns.find((c) => c.key === sortKey.value);
  if (!col) return props.block.rows;
  return [...props.block.rows].sort((a, b) => {
    const va = a.values[col.key];
    const vb = b.values[col.key];
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return sortAsc.value ? cmp : -cmp;
  });
});

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value;
  } else {
    sortKey.value = key;
    sortAsc.value = true;
  }
}

function navigate(row: TableRow) {
  if (row.route) {
    frappe.set_route("Form", row.route.doctype, row.route.name);
  }
}
</script>

<template>
  <div class="copilot-table">
    <div v-if="block.title" class="copilot-table-title">{{ block.title }}</div>
    <div v-if="block.rows.length === 0" class="copilot-table-empty">No data available</div>
    <table v-else>
      <thead>
        <tr>
          <th v-for="col in block.columns" :key="col.key" @click="toggleSort(col.key)">
            {{ col.label }}
            <span v-if="sortKey === col.key">{{ sortAsc ? "\u2191" : "\u2193" }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in sortedRows" :key="i"
            :class="{ 'copilot-table-clickable': !!row.route }"
            @click="navigate(row)">
          <td v-for="col in block.columns" :key="col.key">
            {{ formatValue(row.values[col.key], col.format) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

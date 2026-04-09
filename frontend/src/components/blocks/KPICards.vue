<script setup lang="ts">
import { formatValue } from "@/utils/formatters";
import type { KPIBlock, TrendDirection } from "@/types/blocks";

const props = defineProps<{ block: KPIBlock }>();

const trendArrows: Record<TrendDirection, string> = {
  up: "\u2191",
  down: "\u2193",
  flat: "\u2192",
};
</script>

<template>
  <div class="copilot-kpi-container">
    <div v-for="(metric, i) in block.metrics" :key="i" class="copilot-kpi-card">
      <div class="copilot-kpi-label">{{ metric.label }}</div>
      <div class="copilot-kpi-value">{{ formatValue(metric.value, metric.format) }}</div>
      <div v-if="metric.trend" :class="`copilot-trend copilot-trend--${metric.trend}`">
        <span class="copilot-trend-arrow">{{ trendArrows[metric.trend] }}</span>
        <span v-if="metric.trend_value" class="copilot-trend-value">{{ metric.trend_value }}</span>
      </div>
    </div>
  </div>
</template>

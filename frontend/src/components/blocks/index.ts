/** Block component registry -- maps block type strings to Vue components. */

import type { Component } from "vue";
import type { BlockType } from "@/types/blocks";
import TextBlock from "./TextBlock.vue";

const ChartBlock = () => import("./ChartBlock.vue");
const TableBlock = () => import("./TableBlock.vue");
const KPICards = () => import("./KPICards.vue");
const StatusList = () => import("./StatusList.vue");

export const blockComponentMap: Record<BlockType, Component> = {
  text: TextBlock,
  chart: ChartBlock as unknown as Component,
  table: TableBlock as unknown as Component,
  kpi: KPICards as unknown as Component,
  status_list: StatusList as unknown as Component,
};

export function getBlockComponent(type: string): Component | undefined {
  return blockComponentMap[type as BlockType];
}

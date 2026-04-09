import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";

vi.mock("echarts/core", () => ({
  use: vi.fn(),
  init: vi.fn(),
  throttle: vi.fn((fn: any) => fn),
}));
vi.mock("echarts/renderers", () => ({ CanvasRenderer: {} }));
vi.mock("echarts/charts", () => ({
  BarChart: {},
  LineChart: {},
  PieChart: {},
  FunnelChart: {},
  HeatmapChart: {},
}));
vi.mock("echarts/components", () => ({
  GridComponent: {},
  TooltipComponent: {},
  LegendComponent: {},
  VisualMapComponent: {},
  CalendarComponent: {},
}));

import ChartBlock from "@/components/blocks/ChartBlock.vue";

/** Stub that captures the option prop as a data attribute for assertions. */
const VChartStub = defineComponent({
  name: "VChartStub",
  props: ["option", "autoresize"],
  setup(props) {
    return () =>
      h("div", {
        class: "v-chart-stub",
        "data-option": JSON.stringify(props.option),
      });
  },
});

function mountChart(block: Record<string, unknown>) {
  return mount(ChartBlock, {
    props: { block: block as any },
    global: {
      stubs: { echarts: VChartStub },
    },
  });
}

function getOption(wrapper: ReturnType<typeof mount>) {
  const vchart = wrapper.find(".v-chart-stub");
  expect(vchart.exists()).toBe(true);
  return JSON.parse(vchart.attributes("data-option") || "{}");
}

describe("ChartBlock", () => {
  const barBlock = {
    type: "chart" as const,
    chart_type: "bar" as const,
    title: "Monthly Sales",
    data: {
      labels: ["Jan", "Feb", "Mar"],
      datasets: [{ name: "Revenue", values: [100, 200, 300] }],
    },
    options: { stacked: false },
  };

  it("renders chart container", () => {
    const wrapper = mountChart(barBlock);
    expect(wrapper.find(".copilot-chart").exists()).toBe(true);
  });

  it("renders title when provided", () => {
    const wrapper = mountChart(barBlock);
    expect(wrapper.text()).toContain("Monthly Sales");
  });

  it("does not render title when not provided", () => {
    const noTitleBlock = { ...barBlock, title: undefined };
    const wrapper = mountChart(noTitleBlock);
    expect(wrapper.find(".copilot-chart-title").exists()).toBe(false);
  });

  it("shows empty state when datasets are empty", () => {
    const emptyBlock = {
      ...barBlock,
      data: { labels: [], datasets: [] },
    };
    const wrapper = mountChart(emptyBlock);
    expect(wrapper.text()).toContain("No data available");
  });

  it("passes correct option to VChart for bar chart", () => {
    const wrapper = mountChart(barBlock);
    const option = getOption(wrapper);
    expect(option.xAxis.data).toEqual(["Jan", "Feb", "Mar"]);
    expect(option.series).toHaveLength(1);
    expect(option.series[0].type).toBe("bar");
    expect(option.series[0].data).toEqual([100, 200, 300]);
  });

  it("passes correct option to VChart for line chart", () => {
    const lineBlock = { ...barBlock, chart_type: "line" as const };
    const wrapper = mountChart(lineBlock);
    const option = getOption(wrapper);
    expect(option.series[0].type).toBe("line");
  });

  it("passes correct option to VChart for pie chart", () => {
    const pieBlock = {
      type: "chart" as const,
      chart_type: "pie" as const,
      title: "Distribution",
      data: {
        labels: ["A", "B", "C"],
        datasets: [{ name: "Share", values: [40, 35, 25] }],
      },
    };
    const wrapper = mountChart(pieBlock);
    const option = getOption(wrapper);
    expect(option.series[0].type).toBe("pie");
    expect(option.series[0].data).toEqual([
      { name: "A", value: 40 },
      { name: "B", value: 35 },
      { name: "C", value: 25 },
    ]);
  });

  it("sets stack property when stacked option is true", () => {
    const stackedBlock = { ...barBlock, options: { stacked: true } };
    const wrapper = mountChart(stackedBlock);
    const option = getOption(wrapper);
    expect(option.series[0].stack).toBe("total");
  });

  it("does not set stack when stacked is false", () => {
    const wrapper = mountChart(barBlock);
    const option = getOption(wrapper);
    expect(option.series[0].stack).toBeUndefined();
  });

  it("generates funnel chart option", () => {
    const funnelBlock = {
      type: "chart" as const,
      chart_type: "funnel" as const,
      data: {
        labels: ["Visit", "Click", "Buy"],
        datasets: [{ name: "Funnel", values: [1000, 500, 100] }],
      },
    };
    const wrapper = mountChart(funnelBlock);
    const option = getOption(wrapper);
    expect(option.series[0].type).toBe("funnel");
    expect(option.series[0].data).toEqual([
      { name: "Visit", value: 1000 },
      { name: "Click", value: 500 },
      { name: "Buy", value: 100 },
    ]);
  });

  it("generates heatmap chart option", () => {
    const heatmapBlock = {
      type: "chart" as const,
      chart_type: "heatmap" as const,
      data: {
        labels: ["Mon", "Tue"],
        datasets: [
          { name: "Week1", values: [10, 20] },
          { name: "Week2", values: [30, 40] },
        ],
      },
    };
    const wrapper = mountChart(heatmapBlock);
    const option = getOption(wrapper);
    expect(option.series[0].type).toBe("heatmap");
    expect(option.xAxis.data).toEqual(["Mon", "Tue"]);
    expect(option.yAxis.data).toEqual(["Week1", "Week2"]);
    expect(option.visualMap.min).toBe(10);
    expect(option.visualMap.max).toBe(40);
  });

  it("generates calendar chart option", () => {
    const calBlock = {
      type: "chart" as const,
      chart_type: "calendar" as const,
      data: {
        labels: ["2024-01-01", "2024-01-02"],
        datasets: [{ name: "Commits", values: [5, 12] }],
      },
    };
    const wrapper = mountChart(calBlock);
    const option = getOption(wrapper);
    expect(option.series[0].coordinateSystem).toBe("calendar");
    expect(option.calendar.range).toBe("2024");
  });
});

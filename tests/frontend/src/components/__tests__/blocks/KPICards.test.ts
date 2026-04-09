import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import KPICards from "@/components/blocks/KPICards.vue";

describe("KPICards", () => {
  const block = {
    type: "kpi" as const,
    metrics: [
      { label: "Revenue", value: 125000, format: "currency", trend: "up" as const, trend_value: "+12%" },
      { label: "Orders", value: 42, format: "number", trend: "down" as const, trend_value: "-5%" },
      { label: "Conversion", value: 3.2, format: "percent", trend: "flat" as const },
    ],
  };

  it("renders all metric cards", () => {
    const wrapper = mount(KPICards, { props: { block } });
    expect(wrapper.findAll(".copilot-kpi-card").length).toBe(3);
  });

  it("shows formatted values", () => {
    const wrapper = mount(KPICards, { props: { block } });
    expect(wrapper.text()).toContain("1,25,000");
    expect(wrapper.text()).toContain("42");
    expect(wrapper.text()).toContain("3.2%");
  });

  it("shows trend arrows", () => {
    const wrapper = mount(KPICards, { props: { block } });
    expect(wrapper.text()).toContain("\u2191");
    expect(wrapper.text()).toContain("\u2193");
    expect(wrapper.text()).toContain("\u2192");
  });

  it("applies trend color classes", () => {
    const wrapper = mount(KPICards, { props: { block } });
    expect(wrapper.find(".copilot-trend--up").exists()).toBe(true);
    expect(wrapper.find(".copilot-trend--down").exists()).toBe(true);
    expect(wrapper.find(".copilot-trend--flat").exists()).toBe(true);
  });

  it("shows trend value text", () => {
    const wrapper = mount(KPICards, { props: { block } });
    expect(wrapper.text()).toContain("+12%");
    expect(wrapper.text()).toContain("-5%");
  });
});

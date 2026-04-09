import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import TableBlock from "@/components/blocks/TableBlock.vue";

beforeEach(() => {
  (globalThis as any).frappe = { set_route: vi.fn() };
});

describe("TableBlock", () => {
  const block = {
    type: "table" as const,
    title: "Sales Orders",
    columns: [
      { label: "Name", key: "name", format: "text" },
      { label: "Amount", key: "amount", format: "currency" },
    ],
    rows: [
      {
        values: { name: "SO-001", amount: 5000 },
        route: { doctype: "Sales Order", name: "SO-001" },
      },
      { values: { name: "SO-002", amount: 3000 } },
    ],
  };

  it("renders column headers", () => {
    const wrapper = mount(TableBlock, { props: { block } });
    expect(wrapper.text()).toContain("Name");
    expect(wrapper.text()).toContain("Amount");
  });

  it("renders formatted values", () => {
    const wrapper = mount(TableBlock, { props: { block } });
    expect(wrapper.text()).toContain("5,000");
  });

  it("sorts ascending on header click", async () => {
    const wrapper = mount(TableBlock, { props: { block } });
    await wrapper.findAll("th")[1].trigger("click");
    const rows = wrapper.findAll("tbody tr");
    expect(rows[0].text()).toContain("3,000");
  });

  it("sorts descending on second header click", async () => {
    const wrapper = mount(TableBlock, { props: { block } });
    const th = wrapper.findAll("th")[1];
    await th.trigger("click");
    await th.trigger("click");
    const rows = wrapper.findAll("tbody tr");
    expect(rows[0].text()).toContain("5,000");
  });

  it("shows empty state when no rows", () => {
    const emptyBlock = { ...block, rows: [] };
    const wrapper = mount(TableBlock, { props: { block: emptyBlock } });
    expect(wrapper.text()).toContain("No data available");
  });

  it("navigates on row click when route exists", async () => {
    const wrapper = mount(TableBlock, { props: { block } });
    await wrapper.findAll("tbody tr")[0].trigger("click");
    expect((globalThis as any).frappe.set_route).toHaveBeenCalledWith(
      "Form", "Sales Order", "SO-001",
    );
  });

  it("does not navigate when row has no route", async () => {
    const wrapper = mount(TableBlock, { props: { block } });
    await wrapper.findAll("tbody tr")[1].trigger("click");
    expect((globalThis as any).frappe.set_route).toHaveBeenCalledTimes(0);
  });
});

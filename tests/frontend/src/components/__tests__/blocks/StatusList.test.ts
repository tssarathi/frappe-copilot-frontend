import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import StatusList from "@/components/blocks/StatusList.vue";

beforeEach(() => {
  (globalThis as any).frappe = { set_route: vi.fn() };
});

describe("StatusList", () => {
  const block = {
    type: "status_list" as const,
    title: "Order Status",
    items: [
      { label: "SO-001", status: "Completed", color: "green" as const },
      { label: "SO-002", status: "Pending", color: "yellow" as const, route: { doctype: "Sales Order", name: "SO-002" } },
      { label: "SO-003", status: "Failed", color: "red" as const },
    ],
  };

  it("renders title", () => {
    const wrapper = mount(StatusList, { props: { block } });
    expect(wrapper.text()).toContain("Order Status");
  });

  it("renders all status items", () => {
    const wrapper = mount(StatusList, { props: { block } });
    expect(wrapper.findAll(".copilot-status-item").length).toBe(3);
  });

  it("applies color dot class", () => {
    const wrapper = mount(StatusList, { props: { block } });
    expect(wrapper.find(".copilot-status-dot--green").exists()).toBe(true);
  });

  it("shows status badge", () => {
    const wrapper = mount(StatusList, { props: { block } });
    expect(wrapper.text()).toContain("Completed");
    expect(wrapper.text()).toContain("Pending");
  });

  it("navigates on click when route exists", async () => {
    const wrapper = mount(StatusList, { props: { block } });
    await wrapper.findAll(".copilot-status-item")[1].trigger("click");
    expect((globalThis as any).frappe.set_route).toHaveBeenCalledWith(
      "Form", "Sales Order", "SO-002",
    );
  });

  it("does not navigate when no route", async () => {
    const wrapper = mount(StatusList, { props: { block } });
    await wrapper.findAll(".copilot-status-item")[0].trigger("click");
    expect((globalThis as any).frappe.set_route).not.toHaveBeenCalled();
  });
});

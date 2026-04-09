import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ConnectionStatus from "@/components/ConnectionStatus.vue";

describe("ConnectionStatus", () => {
  it("shows green indicator when connected", () => {
    const wrapper = mount(ConnectionStatus, { props: { state: "connected" } });
    expect(wrapper.find(".copilot-conn--connected").exists()).toBe(true);
  });

  it("shows orange indicator when connecting", () => {
    const wrapper = mount(ConnectionStatus, { props: { state: "connecting" } });
    expect(wrapper.find(".copilot-conn--connecting").exists()).toBe(true);
  });

  it("shows red indicator when disconnected", () => {
    const wrapper = mount(ConnectionStatus, { props: { state: "disconnected" } });
    expect(wrapper.find(".copilot-conn--disconnected").exists()).toBe(true);
  });

  it("shows red indicator on error", () => {
    const wrapper = mount(ConnectionStatus, { props: { state: "error" } });
    expect(wrapper.find(".copilot-conn--error").exists()).toBe(true);
  });
});

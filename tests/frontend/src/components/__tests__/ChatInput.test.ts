import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ChatInput from "@/components/ChatInput.vue";

describe("ChatInput", () => {
  it("renders textarea and send button", () => {
    const wrapper = mount(ChatInput, { props: { disabled: false } });
    expect(wrapper.find("textarea").exists()).toBe(true);
    expect(wrapper.find("button").exists()).toBe(true);
  });

  it("emits send event on button click with content", async () => {
    const wrapper = mount(ChatInput, { props: { disabled: false } });
    await wrapper.find("textarea").setValue("Hello agent");
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("send")).toBeTruthy();
    expect(wrapper.emitted("send")![0]).toEqual(["Hello agent"]);
  });

  it("does not emit send when content is empty", async () => {
    const wrapper = mount(ChatInput, { props: { disabled: false } });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("send")).toBeFalsy();
  });

  it("emits send on Enter key (not Shift+Enter)", async () => {
    const wrapper = mount(ChatInput, { props: { disabled: false } });
    await wrapper.find("textarea").setValue("Test");
    await wrapper.find("textarea").trigger("keydown", { key: "Enter", shiftKey: false });
    expect(wrapper.emitted("send")).toBeTruthy();
  });

  it("does not emit send on Shift+Enter", async () => {
    const wrapper = mount(ChatInput, { props: { disabled: false } });
    await wrapper.find("textarea").setValue("Test");
    await wrapper.find("textarea").trigger("keydown", { key: "Enter", shiftKey: true });
    expect(wrapper.emitted("send")).toBeFalsy();
  });

  it("shows disabled hint when disabled", () => {
    const wrapper = mount(ChatInput, { props: { disabled: true } });
    expect(wrapper.find("textarea").attributes("placeholder")).toContain("Connecting");
  });
});

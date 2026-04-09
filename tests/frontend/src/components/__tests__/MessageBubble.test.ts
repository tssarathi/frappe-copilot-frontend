import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MessageBubble from "@/components/MessageBubble.vue";

describe("MessageBubble", () => {
  it("renders user message with right alignment", () => {
    const msg = { id: "1", role: "user" as const, content: "Hello", timestamp: new Date() };
    const wrapper = mount(MessageBubble, { props: { message: msg } });
    expect(wrapper.find(".copilot-bubble--user").exists()).toBe(true);
    expect(wrapper.text()).toContain("Hello");
  });

  it("renders assistant message with blocks", () => {
    const msg = {
      id: "2",
      role: "assistant" as const,
      content: "",
      blocks: [{ type: "text" as const, content: "Response text" }],
      timestamp: new Date(),
    };
    const wrapper = mount(MessageBubble, {
      props: { message: msg },
      global: {
        stubs: { TextBlock: { template: '<div class="text-stub">{{ $attrs.block.content }}</div>' } },
      },
    });
    expect(wrapper.find(".copilot-bubble--assistant").exists()).toBe(true);
  });

  it("renders error message with category styling", () => {
    const msg = {
      id: "3",
      role: "error" as const,
      content: "Rate limited",
      error: { code: "RATE_LIMITED", message: "Too many requests", suggestion: "Please wait" },
      timestamp: new Date(),
    };
    const wrapper = mount(MessageBubble, { props: { message: msg } });
    expect(wrapper.find(".copilot-error").exists()).toBe(true);
    expect(wrapper.text()).toContain("Too many requests");
    expect(wrapper.text()).toContain("Please wait");
  });

  it("applies critical class for auth errors", () => {
    const msg = {
      id: "4",
      role: "error" as const,
      content: "Auth failed",
      error: { code: "AUTH_FAILURE", message: "Invalid token" },
      timestamp: new Date(),
    };
    const wrapper = mount(MessageBubble, { props: { message: msg } });
    expect(wrapper.find(".copilot-error--critical").exists()).toBe(true);
  });

  it("applies warning class for mcp errors", () => {
    const msg = {
      id: "5",
      role: "error" as const,
      content: "MCP down",
      error: { code: "MCP_UNREACHABLE", message: "Cannot connect to MCP" },
      timestamp: new Date(),
    };
    const wrapper = mount(MessageBubble, { props: { message: msg } });
    expect(wrapper.find(".copilot-error--warning").exists()).toBe(true);
  });

  it("applies info class for generic errors", () => {
    const msg = {
      id: "6",
      role: "error" as const,
      content: "Something failed",
      error: { code: "INTERNAL", message: "Internal error" },
      timestamp: new Date(),
    };
    const wrapper = mount(MessageBubble, { props: { message: msg } });
    expect(wrapper.find(".copilot-error--info").exists()).toBe(true);
  });

  it("shows timestamp", () => {
    const time = new Date(2026, 0, 15, 14, 30);
    const msg = { id: "7", role: "user" as const, content: "Test", timestamp: time };
    const wrapper = mount(MessageBubble, { props: { message: msg } });
    expect(wrapper.text()).toContain("2:30");
  });
});

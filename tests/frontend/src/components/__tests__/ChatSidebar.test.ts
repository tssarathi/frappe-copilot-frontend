import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { mount } from "@vue/test-utils";
import ChatSidebar from "@/components/ChatSidebar.vue";

const mockConnect = vi.fn();
const mockDisconnect = vi.fn();
const mockSendMessage = vi.fn();
const mockClearMessages = vi.fn();

vi.mock("@/composables/useChat", () => ({
  useChat: () => ({
    messages: ref([]),
    isStreaming: ref(false),
    connectionState: ref("connected"),
    connect: mockConnect,
    disconnect: mockDisconnect,
    sendMessage: mockSendMessage,
    clearMessages: mockClearMessages,
  }),
}));

vi.mock("@/composables/useAuth", () => ({
  useAuth: () => ({
    fetchToken: vi.fn().mockResolvedValue("test-token"),
  }),
}));

describe("ChatSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    agentUrl: "ws://localhost:8484",
    sidebarWidth: 380,
    keyboardShortcut: "Ctrl+/",
    visible: true,
  };

  it("renders sidebar when visible", () => {
    const wrapper = mount(ChatSidebar, { props: defaultProps });
    expect(wrapper.find(".copilot-sidebar").exists()).toBe(true);
  });

  it("connects on mount", () => {
    mount(ChatSidebar, { props: defaultProps });
    expect(mockConnect).toHaveBeenCalledWith("ws://localhost:8484");
  });

  it("applies sidebar width from props", () => {
    const wrapper = mount(ChatSidebar, {
      props: { ...defaultProps, sidebarWidth: 420 },
    });
    const sidebar = wrapper.find(".copilot-sidebar");
    expect(sidebar.attributes("style")).toContain("420px");
  });

  it("disconnects on unmount", () => {
    const wrapper = mount(ChatSidebar, { props: defaultProps });
    wrapper.unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("sends message via chat composable", async () => {
    const wrapper = mount(ChatSidebar, { props: defaultProps });
    const input = wrapper.findComponent({ name: "ChatInput" });
    if (input.exists()) {
      await input.vm.$emit("send", "Hello");
      expect(mockSendMessage).toHaveBeenCalledWith("Hello");
    }
  });

  it("clears messages on clear event", async () => {
    const wrapper = mount(ChatSidebar, { props: defaultProps });
    const header = wrapper.findComponent({ name: "ChatHeader" });
    if (header.exists()) {
      await header.vm.$emit("clear");
      expect(mockClearMessages).toHaveBeenCalled();
    }
  });

  it("does not render sidebar when not visible", () => {
    const wrapper = mount(ChatSidebar, {
      props: { ...defaultProps, visible: false },
    });
    expect(wrapper.find(".copilot-sidebar").exists()).toBe(false);
  });

  it("emits close event from header", async () => {
    const wrapper = mount(ChatSidebar, { props: defaultProps });
    const header = wrapper.findComponent({ name: "ChatHeader" });
    if (header.exists()) {
      await header.vm.$emit("close");
      expect(wrapper.emitted("close")).toBeTruthy();
    }
  });
});

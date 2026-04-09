import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import TextBlock from "@/components/blocks/TextBlock.vue";

describe("TextBlock", () => {
  it("renders markdown content as HTML", () => {
    const wrapper = mount(TextBlock, {
      props: { block: { type: "text", content: "**bold** text" } },
    });
    expect(wrapper.html()).toContain("<strong>bold</strong>");
    expect(wrapper.html()).toContain("text");
  });

  it("renders code blocks", () => {
    const wrapper = mount(TextBlock, {
      props: { block: { type: "text", content: "```python\nprint('hi')\n```" } },
    });
    expect(wrapper.html()).toContain("<code");
    expect(wrapper.html()).toContain("print");
  });

  it("renders links with target=_blank", () => {
    const wrapper = mount(TextBlock, {
      props: { block: { type: "text", content: "[link](https://example.com)" } },
    });
    const anchor = wrapper.find("a");
    expect(anchor.exists()).toBe(true);
    expect(anchor.attributes("href")).toBe("https://example.com");
    expect(anchor.attributes("target")).toBe("_blank");
  });

  it("handles empty content", () => {
    const wrapper = mount(TextBlock, {
      props: { block: { type: "text", content: "" } },
    });
    expect(wrapper.find(".copilot-markdown").exists()).toBe(true);
  });

  it("escapes HTML in content", () => {
    const wrapper = mount(TextBlock, {
      props: { block: { type: "text", content: "<script>alert('xss')</script>" } },
    });
    expect(wrapper.html()).not.toContain("<script>");
  });
});

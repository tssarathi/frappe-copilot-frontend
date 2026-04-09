import { describe, it, expect, beforeEach } from "vitest";
import { getPageContext } from "@/utils/context";

describe("getPageContext", () => {
  beforeEach(() => {
    (globalThis as any).frappe = undefined;
    (globalThis as any).cur_frm = undefined;
    (globalThis as any).cur_list = undefined;
  });

  it("returns empty context when frappe is not available", () => {
    const ctx = getPageContext();
    expect(ctx).toEqual({ route: "", doctype: "", docname: "" });
  });

  it("extracts route from frappe router", () => {
    (globalThis as any).frappe = {
      router: { current_route: ["Form", "Sales Order", "SO-001"] },
    };
    const ctx = getPageContext();
    expect(ctx.route).toBe("Form/Sales Order/SO-001");
  });

  it("extracts doctype and docname from cur_frm", () => {
    (globalThis as any).frappe = { router: {} };
    (globalThis as any).cur_frm = {
      doc: { doctype: "Sales Order", name: "SO-001" },
    };
    const ctx = getPageContext();
    expect(ctx.doctype).toBe("Sales Order");
    expect(ctx.docname).toBe("SO-001");
  });

  it("extracts doctype from cur_list", () => {
    (globalThis as any).frappe = { router: {} };
    (globalThis as any).cur_list = { doctype: "Sales Invoice" };
    const ctx = getPageContext();
    expect(ctx.doctype).toBe("Sales Invoice");
    expect(ctx.docname).toBe("");
  });
});

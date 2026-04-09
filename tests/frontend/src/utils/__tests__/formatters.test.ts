import { describe, it, expect } from "vitest";
import { formatValue } from "@/utils/formatters";

describe("formatValue", () => {
  it("returns dash for null or undefined", () => {
    expect(formatValue(null)).toBe("—");
    expect(formatValue(undefined)).toBe("—");
  });

  it("formats currency with INR by default", () => {
    const result = formatValue(12500, "currency");
    expect(result).toContain("12,500");
  });

  it("formats currency with custom currency", () => {
    const result = formatValue(9999, "currency", { currency: "USD" });
    expect(result).toContain("9,999");
  });

  it("formats percent", () => {
    expect(formatValue(75.5, "percent")).toBe("75.5%");
  });

  it("formats number with en-IN locale grouping", () => {
    const result = formatValue(1234567, "number");
    // en-IN uses lakh/crore grouping: 12,34,567
    expect(result).toBe("12,34,567");
  });

  it("formats date", () => {
    const result = formatValue("2026-01-15", "date");
    expect(result).toContain("2026");
    expect(result).toContain("Jan");
  });

  it("returns value as string for text format", () => {
    expect(formatValue("hello", "text")).toBe("hello");
  });

  it("returns value as string for unknown format", () => {
    expect(formatValue(42)).toBe("42");
  });
});

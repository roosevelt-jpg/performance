import { describe, expect, it } from "vitest";
import { normalizeStoreDomain } from "./domain";

describe("normalizeStoreDomain", () => {
  it("stores the Shopify hostname from a pasted store URL", () => {
    expect(normalizeStoreDomain("https://theformulaperformance.com/")).toBe(
      "theformulaperformance.com",
    );
    expect(normalizeStoreDomain("https://www.theformulaperformance.com")).toBe(
      "theformulaperformance.com",
    );
    expect(normalizeStoreDomain("theformulaperformance.com")).toBe(
      "theformulaperformance.com",
    );
  });
});

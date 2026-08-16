import { describe, expect, it } from "vitest";
import {
  isPlaceholderStoreDomain,
  normalizeStoreDomain,
  resolveStoreDomain,
} from "./domain";

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

describe("resolveStoreDomain", () => {
  it("replaces the Vercel Marketplace placeholder with Kane's shop", () => {
    expect(
      isPlaceholderStoreDomain(
        "vercel-store-ed52b137-0gurug0q.myshopify.com",
      ),
    ).toBe(true);
    expect(
      resolveStoreDomain("vercel-store-ed52b137-0gurug0q.myshopify.com"),
    ).toBe("theformulaperformance.com");
    expect(resolveStoreDomain("https://theformulaperformance.com/")).toBe(
      "theformulaperformance.com",
    );
    expect(resolveStoreDomain("some-real-shop.myshopify.com")).toBe(
      "some-real-shop.myshopify.com",
    );
  });
});

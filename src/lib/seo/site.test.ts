import { describe, expect, it } from "vitest";
import { parseKeywords, sanitizeGa4Id, sanitizeGtmId } from "./site";
import { GOOGLE_CRAWLERS } from "./site";

describe("SEO helpers", () => {
  it("keeps only valid Google measurement IDs", () => {
    expect(sanitizeGa4Id("G-ABC123")).toBe("G-ABC123");
    expect(sanitizeGa4Id("not-an-id")).toBe("");
    expect(sanitizeGtmId("gtm-XXXX1")).toBe("GTM-XXXX1");
  });

  it("splits keywords", () => {
    expect(parseKeywords("coaching, 1:1, ")).toEqual(["coaching", "1:1"]);
  });

  it("lists Google crawlers for robots.txt", () => {
    expect(GOOGLE_CRAWLERS).toContain("Googlebot");
    expect(GOOGLE_CRAWLERS).toContain("Googlebot-Image");
    expect(GOOGLE_CRAWLERS).toContain("Googlebot-Video");
    expect(GOOGLE_CRAWLERS).toContain("AdsBot-Google");
  });
});

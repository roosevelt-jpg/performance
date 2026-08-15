import { describe, expect, it } from "vitest";
import { DEFAULT_CMS } from "./defaults";
import { mergeCms } from "./store";

describe("mergeCms list blocks", () => {
  it("keeps an empty FAQ list instead of restoring defaults", () => {
    const overlay = structuredClone(DEFAULT_CMS);
    overlay.home.faq.items = [];
    expect(mergeCms(DEFAULT_CMS, overlay).home.faq.items).toEqual([]);
  });

  it("keeps extra FAQ questions added in CMS", () => {
    const overlay = structuredClone(DEFAULT_CMS);
    overlay.home.faq.items.push({
      id: "extra",
      question: "New question?",
      answer: "New answer.",
    });
    expect(mergeCms(DEFAULT_CMS, overlay).home.faq.items).toHaveLength(
      DEFAULT_CMS.home.faq.items.length + 1,
    );
  });

  it("keeps empty credentials, WhatsApp steps, and funnel steps", () => {
    const overlay = structuredClone(DEFAULT_CMS);
    overlay.home.credentials.items = [];
    overlay.home.whatsappCoach.steps = [];
    overlay.funnel.steps = [];
    const next = mergeCms(DEFAULT_CMS, overlay);
    expect(next.home.credentials.items).toEqual([]);
    expect(next.home.whatsappCoach.steps).toEqual([]);
    expect(next.funnel.steps).toEqual([]);
  });
});

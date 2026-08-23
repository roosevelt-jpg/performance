import { afterEach, describe, expect, it, vi } from "vitest";
import { applicationNote, leadAutomationTags, upsertLeadInGhl } from "./ghl";
import type { LeadSubmissionPayload } from "@/types/lead";
import { loadIntegrations } from "@/lib/integrations/store";

vi.mock("@/lib/integrations/store", () => ({
  loadIntegrations: vi.fn(),
}));

const payload: LeadSubmissionPayload = {
  answers: {
    tier: "pro",
    name: "Sam Lee",
    email: "sam@example.com",
    mobile: "07000000000",
    instagram: "-",
    mainGoal: "fat loss",
    trainingNow: "3–4 days",
    daysCommit: "2",
    medical: "none",
    stoppedResults: "via chat",
    whyNow: "via chat",
    structuredProgramme: "via chat",
    investment: "No",
    privacyConsent: true,
  },
  consent: {
    privacy: true,
    source: "funnel_chat",
    timestamp: "2026-08-15T00:00:00.000Z",
  },
  evaluation: {
    outcome: "disqualified",
    flags: ["low_commitment", "investment_no"],
    disqualifyReasons: ["commitment", "investment"],
  },
};

describe("leadAutomationTags", () => {
  it("emits GHL trigger tags for chat + outcome", () => {
    expect(leadAutomationTags(payload)).toEqual(
      expect.arrayContaining([
        "funnel_apply",
        "source_funnel_chat",
        "funnel_disqualified",
        "funnel_commitment",
        "funnel_investment",
        "tier_pro",
        "flag_low_commitment",
        "flag_investment_no",
      ]),
    );
  });
});

describe("applicationNote", () => {
  it("summarises the application for the GHL contact", () => {
    const note = applicationNote(payload);
    expect(note).toContain("disqualified");
    expect(note).toContain("funnel_chat");
    expect(note).toContain("Days commit: 2");
  });
});

describe("upsertLeadInGhl", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("falls back to a mock contact instead of throwing when the API key is invalid", async () => {
    vi.mocked(loadIntegrations).mockResolvedValue({
      ghl: {
        apiKey: "wrong-key-ending-in-365!",
        locationId: "loc_123",
        apiBaseUrl: "https://services.leadconnectorhq.com",
        workflowQualifiedId: "",
        workflowDisqualifiedId: "",
      },
      // Only `ghl` is read by upsertLeadInGhl.
    } as unknown as Awaited<ReturnType<typeof loadIntegrations>>);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve("Invalid JWT"),
      }),
    );

    const result = await upsertLeadInGhl(payload);

    expect(result.mocked).toBe(true);
    expect(result.id).toMatch(/^mock_/);
    expect(result.automation).toEqual({
      mocked: true,
      noteAdded: false,
      workflowTriggered: false,
    });
  });
});

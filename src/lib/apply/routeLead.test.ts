import { describe, expect, it } from "vitest";
import { DEFAULT_APPLY_ROUTING } from "./defaults";
import { routeApplyLead } from "./routeLead";
import type { ApplyAnswers } from "./types";

const base: ApplyAnswers = {
  name: "Sam",
  email: "sam@example.com",
  mobile: "07000000000",
  goal: "Lose fat",
  startingPoint: "I train on and off",
  days: "three_four",
  obstacles: ["Staying consistent"],
  timeline: "immediately",
  coachHistory: "Never",
  investment: "500_1000",
};

describe("routeApplyLead", () => {
  it("sends under £150 to the free group", () => {
    expect(routeApplyLead({ ...base, investment: "under_150" })).toBe(
      "nurture",
    );
  });

  it("sends just-looking to the free group even with budget", () => {
    expect(
      routeApplyLead({
        ...base,
        investment: "1000_plus",
        timeline: "looking",
      }),
    ).toBe("nurture");
  });

  it("sends £150–£500 to the Challenge", () => {
    expect(routeApplyLead({ ...base, investment: "150_500" })).toBe("low");
  });

  it("protects 1:1 from high budget but under two training days", () => {
    expect(
      routeApplyLead({
        ...base,
        investment: "1000_plus",
        days: "under_two",
      }),
    ).toBe("low");
  });

  it("books Pro at £500–£1,000 with three-plus days", () => {
    expect(routeApplyLead(base)).toBe("high_pro");
  });

  it("books Elite at £1,000+ with three-plus days", () => {
    expect(routeApplyLead({ ...base, investment: "1000_plus" })).toBe(
      "high_elite",
    );
  });

  it("uses CMS routing overlay for custom investment ids", () => {
    expect(
      routeApplyLead(
        { ...base, investment: "premium" },
        {
          ...DEFAULT_APPLY_ROUTING,
          highEliteInvestmentIds: ["premium"],
        },
      ),
    ).toBe("high_elite");
  });
});

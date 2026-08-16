import { describe, expect, it } from "vitest";
import { leadFlowFromApply } from "./toLeadFlow";
import type { ApplyAnswers } from "./types";

const answers: ApplyAnswers = {
  name: "Sam",
  email: "sam@example.com",
  mobile: "+447700900123",
  goal: "Lose fat",
  startingPoint: "I train on and off",
  days: "three_four",
  obstacles: ["Nutrition"],
  timeline: "immediately",
  coachHistory: "Never",
  investment: "500_1000",
};

describe("leadFlowFromApply", () => {
  it("opens a qualified Pro calendar session after a high apply route", () => {
    const flow = leadFlowFromApply({
      answers,
      route: "high_pro",
      submissionId: "ap_1",
    });
    expect(flow?.tier).toBe("pro");
    expect(flow?.evaluation?.outcome).toBe("qualified");
    expect(flow?.answers?.daysCommit).toBe("3");
    expect(flow?.answers?.investment).toBe("Yes");
    expect(flow?.submissionId).toBe("ap_1");
  });

  it("does not open Kane's calendar for Challenge or group exits", () => {
    expect(
      leadFlowFromApply({ answers, route: "low", submissionId: "ap_2" }),
    ).toBeNull();
    expect(
      leadFlowFromApply({ answers, route: "nurture", submissionId: "ap_3" }),
    ).toBeNull();
  });
});

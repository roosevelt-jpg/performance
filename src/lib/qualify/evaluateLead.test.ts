import { describe, expect, it } from "vitest";
import { evaluateLead } from "./evaluateLead";

describe("evaluateLead", () => {
  it("qualifies when commitment >= 3 and investment is Yes", () => {
    const result = evaluateLead({
      daysCommit: "3",
      investment: "Yes",
      medical: "None",
    });
    expect(result.outcome).toBe("qualified");
    expect(result.flags).toEqual([]);
    expect(result.disqualifyReasons).toEqual([]);
  });

  it("disqualifies when Q4 is under 3 days", () => {
    const result = evaluateLead({
      daysCommit: "2",
      investment: "Yes",
      medical: "None",
    });
    expect(result.outcome).toBe("disqualified");
    expect(result.disqualifyReasons).toContain("commitment");
    expect(result.flags).toContain("low_commitment");
  });

  it("disqualifies when Q9 is No", () => {
    const result = evaluateLead({
      daysCommit: "4",
      investment: "No",
      medical: "None",
    });
    expect(result.outcome).toBe("disqualified");
    expect(result.disqualifyReasons).toContain("investment");
    expect(result.flags).toContain("investment_no");
  });

  it("qualifies with pricing_discussion flag when Q9 is I'd like to know more", () => {
    const result = evaluateLead({
      daysCommit: "5+",
      investment: "I'd like to know more",
      medical: "None",
    });
    expect(result.outcome).toBe("qualified");
    expect(result.flags).toContain("pricing_discussion");
  });

  it("qualifies with medical_review when Q5 is not none-equivalent", () => {
    const result = evaluateLead({
      daysCommit: "3",
      investment: "Yes",
      medical: "Bad knee — ACL repair 2022",
    });
    expect(result.outcome).toBe("qualified");
    expect(result.flags).toContain("medical_review");
  });

  it("does not flag medical for none/no variants", () => {
    for (const medical of ["None", "no", "N/A", "  none  "]) {
      const result = evaluateLead({
        daysCommit: "3",
        investment: "Yes",
        medical,
      });
      expect(result.flags).not.toContain("medical_review");
    }
  });

  it("collects both disqualify reasons when both gates fail", () => {
    const result = evaluateLead({
      daysCommit: "1",
      investment: "No",
      medical: "asthma",
    });
    expect(result.outcome).toBe("disqualified");
    expect(result.disqualifyReasons).toEqual(["commitment", "investment"]);
    expect(result.flags).toContain("medical_review");
  });
});

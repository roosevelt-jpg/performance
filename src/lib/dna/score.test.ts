import { describe, expect, it } from "vitest";
import { DEFAULT_DNA, DNA_QUESTIONS } from "./questions";
import { scoreDna } from "./score";

function fill(scoreId: string) {
  const answers: Record<string, string> = {};
  for (const q of DNA_QUESTIONS) {
    answers[q.id] = scoreId;
  }
  return answers;
}

describe("scoreDna", () => {
  it("routes a high standard to Kane's 1:1", () => {
    const result = scoreDna(fill("a"));
    expect(result.overall).toBe(100);
    expect(result.path).toBe("call");
    expect(result.coach.id).toBe("kane");
    expect(result.copySource).toBe("native");
  });

  it("routes a mid leak to the Challenge", () => {
    const result = scoreDna(fill("b"));
    expect(result.path).toBe("challenge");
    expect(result.coach.forPath).toBe("challenge");
  });

  it("writes a next-step insight on every category", () => {
    const result = scoreDna(fill("b"));
    expect(result.categories.every((c) => c.insight.length > 20)).toBe(true);
  });

  it("routes a low score to the free group", () => {
    const result = scoreDna(fill("d"));
    expect(result.overall).toBe(0);
    expect(result.path).toBe("group");
  });

  it("never sends 'just looking' to Kane even with a perfect training week", () => {
    const result = scoreDna({ ...fill("a"), m2: "d" });
    expect(result.path).toBe("group");
    expect(result.flags).toContain("just_looking");
  });

  it("blocks 1:1 when real sessions are under three a week", () => {
    const result = scoreDna({ ...fill("a"), t1: "c" });
    expect(result.path).toBe("challenge");
    expect(result.flags).toContain("low_frequency");
  });

  it("refuses 1:1 when they do not want accountability", () => {
    const result = scoreDna({ ...fill("a"), m1: "d" });
    expect(result.path).toBe("group");
  });

  it("names the weakest category as the leak", () => {
    const result = scoreDna({ ...fill("a"), n1: "d", n2: "d" });
    expect(result.primaryLeak.id).toBe("nutrition");
    expect(result.summary).toMatch(/nutrition/i);
  });

  it("weights training above journey on the overall", () => {
    const trainingHeavy = scoreDna({ ...fill("d"), t1: "a", t2: "a" });
    const journeyHeavy = scoreDna({ ...fill("d"), j1: "a", j2: "a" });
    expect(trainingHeavy.overall).toBeGreaterThan(journeyHeavy.overall);
  });

  it("keeps the curious-but-uncommitted person off Kane's calendar", () => {
    const result = scoreDna({ ...fill("a"), m2: "c" });
    expect(result.path).toBe("challenge");
    expect(result.flags).toContain("uncommitted");
  });

  it("honours CMS gate overlay from Funnel", () => {
    const result = scoreDna(fill("a"), {
      ...DEFAULT_DNA,
      gates: { ...DEFAULT_DNA.gates, callMinOverall: 101 },
    });
    expect(result.path).toBe("challenge");
  });
});

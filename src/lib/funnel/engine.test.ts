import { describe, expect, it } from "vitest";
import {
  answersFromChat,
  interpolateFunnelText,
  validateChatField,
} from "./engine";
import { isFunnelApplyHref, tierFromHref } from "./open";

describe("interpolateFunnelText", () => {
  it("fills name, tier label, and price", () => {
    expect(
      interpolateFunnelText("{tier} starts at {price}, {name}.", {
        name: "Sam",
        tier: "elite",
        price: "£497",
      }),
    ).toBe("Elite starts at £497, Sam.");
  });

  it("falls back when name is empty", () => {
    expect(interpolateFunnelText("Hi {name}", { name: "  " })).toBe(
      "Hi there",
    );
  });
});

describe("answersFromChat", () => {
  it("fills skipped qualifier fields so the leads API accepts the payload", () => {
    const answers = answersFromChat(
      {
        name: "Sam",
        email: "sam@example.com",
        mobile: "07000000000",
        daysCommit: "4",
        investment: "Yes",
        privacyConsent: true,
      },
      "pro",
    );
    expect(answers.tier).toBe("pro");
    expect(answers.instagram).toBe("-");
    expect(answers.medical).toBe("none");
    expect(answers.trainingNow).toBe("3–4 days");
    expect(answers.stoppedResults).toBe("via chat");
  });
});

describe("validateChatField", () => {
  it("requires a real email", () => {
    expect(validateChatField("email", { email: "nope" })).toBeTruthy();
    expect(validateChatField("email", { email: "a@b.com" })).toBeNull();
  });
});

describe("isFunnelApplyHref", () => {
  it("treats /book as apply and calendar as not", () => {
    expect(isFunnelApplyHref("/book?tier=pro")).toBe(true);
    expect(isFunnelApplyHref("/book/calendar")).toBe(false);
    expect(isFunnelApplyHref("#vsl")).toBe(false);
    expect(isFunnelApplyHref("#start")).toBe(true);
  });

  it("reads tier from the href", () => {
    expect(tierFromHref("/book?tier=elite")).toBe("elite");
    expect(tierFromHref("/book?tier=pro")).toBe("pro");
  });
});

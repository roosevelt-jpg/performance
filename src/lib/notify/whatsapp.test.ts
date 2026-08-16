import { describe, expect, it } from "vitest";
import { whatsappDigits, whatsappReady } from "./whatsapp";

describe("whatsappDigits", () => {
  it("strips prefix, plus and spaces", () => {
    expect(whatsappDigits("whatsapp:+44 7700 900123")).toBe("447700900123");
  });
});

describe("whatsappReady", () => {
  it("needs both phone number id and token", () => {
    expect(whatsappReady("123", "")).toBe(false);
    expect(whatsappReady("123", "token")).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import {
  ianaTimeZones,
  isValidTimeZone,
  timezoneOptionLabel,
} from "./timezones";

describe("ianaTimeZones", () => {
  it("lists every IANA zone the runtime knows, including Kane's and visitor zones", () => {
    const zones = ianaTimeZones();
    expect(zones.length).toBeGreaterThan(300);
    expect(zones).toContain("Europe/London");
    expect(zones).toContain("America/New_York");
    expect(zones).toContain("Asia/Dubai");
    expect(zones).toContain("Pacific/Auckland");
  });
});

describe("isValidTimeZone", () => {
  it("accepts IANA ids and rejects junk", () => {
    expect(isValidTimeZone("Europe/London")).toBe(true);
    expect(isValidTimeZone("UTC")).toBe(true);
    expect(isValidTimeZone("Not/AZone")).toBe(false);
    expect(isValidTimeZone("")).toBe(false);
  });
});

describe("timezoneOptionLabel", () => {
  it("keeps the IANA id readable", () => {
    expect(timezoneOptionLabel("Europe/London")).toMatch(/London/);
  });
});

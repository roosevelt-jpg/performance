import { describe, expect, it, vi, afterEach } from "vitest";
import {
  createSessionToken,
  verifyAdminCredentials,
  verifySessionToken,
} from "./session";
import { ADMIN_SESSION_TTL_MS } from "./idle";

describe("verifyAdminCredentials", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts the username ignoring case", () => {
    vi.stubEnv("ADMIN_USERNAME", "admin");
    vi.stubEnv("ADMIN_PASSWORD", "test-password");
    expect(verifyAdminCredentials("Admin", "test-password")).toBe(true);
    expect(verifyAdminCredentials("admin", "test-password")).toBe(true);
    expect(verifyAdminCredentials("admin", "wrong")).toBe(false);
  });
});

describe("admin session lifetime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("is ten minutes", () => {
    expect(ADMIN_SESSION_TTL_MS).toBe(10 * 60 * 1000);
  });

  it("rejects a token left unused past ten minutes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-17T12:00:00Z"));
    const token = createSessionToken("kane");
    expect(verifySessionToken(token)).toEqual({ ok: true, username: "kane" });
    vi.setSystemTime(new Date("2026-08-17T12:09:50Z"));
    expect(verifySessionToken(token).ok).toBe(true);
    vi.setSystemTime(new Date("2026-08-17T12:10:01Z"));
    expect(verifySessionToken(token).ok).toBe(false);
  });
});

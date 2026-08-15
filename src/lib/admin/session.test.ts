import { describe, expect, it, vi, afterEach } from "vitest";
import { verifyAdminCredentials } from "./session";

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

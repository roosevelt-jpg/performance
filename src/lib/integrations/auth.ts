import {
  getAdminCredentials,
  readSessionFromRequest,
} from "@/lib/admin/session";
import { timingSafeEqual } from "crypto";

/** Optional machine token for scripts — secondary to admin login session. */
function getLegacyApiToken(): string | undefined {
  const token = process.env.INTEGRATIONS_ADMIN_TOKEN?.trim();
  return token || undefined;
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function authorizeIntegrationsRequest(
  request: Request,
): { ok: true; via: "session" | "token" } | { ok: false; status: number; error: string } {
  const session = readSessionFromRequest(request);
  if (session.ok) {
    return { ok: true, via: "session" };
  }

  const legacy = getLegacyApiToken();
  if (legacy) {
    const header = request.headers.get("authorization") ?? "";
    const bearer = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    const alt = request.headers.get("x-integrations-token")?.trim() ?? "";
    const provided = bearer || alt;
    if (provided && safeEqual(provided, legacy)) {
      return { ok: true, via: "token" };
    }
  }

  if (!getAdminCredentials()) {
    return {
      ok: false,
      status: 503,
      error:
        "Admin credentials are not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD.",
    };
  }

  return {
    ok: false,
    status: 401,
    error: "Unauthorized — sign in at /admin/login",
  };
}

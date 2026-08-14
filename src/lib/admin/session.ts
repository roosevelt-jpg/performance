import { createHmac, timingSafeEqual, randomBytes } from "crypto";

const COOKIE_NAME = "c365_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

export type AdminCredentials = {
  username: string;
  password: string;
};

export function getAdminCredentials(): AdminCredentials | null {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!username || !password) return null;
  return { username, password };
}

function sessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    "dev-insecure-session-secret"
  );
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function verifyAdminCredentials(
  username: string,
  password: string,
): boolean {
  const expected = getAdminCredentials();
  if (!expected) return false;
  return (
    safeEqual(username.trim(), expected.username) &&
    safeEqual(password, expected.password)
  );
}

type SessionPayload = {
  u: string;
  exp: number;
  n: string;
};

function sign(payloadB64: string): string {
  return createHmac("sha256", sessionSecret())
    .update(payloadB64)
    .digest("base64url");
}

export function createSessionToken(username: string): string {
  const payload: SessionPayload = {
    u: username,
    exp: Date.now() + SESSION_TTL_MS,
    n: randomBytes(8).toString("hex"),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifySessionToken(
  token: string | undefined | null,
): { ok: true; username: string } | { ok: false } {
  if (!token) return { ok: false };
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return { ok: false };
  const expectedSig = sign(payloadB64);
  if (!safeEqual(signature, expectedSig)) return { ok: false };

  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (!payload.u || !payload.exp || payload.exp < Date.now()) {
      return { ok: false };
    }
    return { ok: true, username: payload.u };
  } catch {
    return { ok: false };
  }
}

export function getSessionCookieName() {
  return COOKIE_NAME;
}

export function buildSessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}${secure}`;
}

export function clearSessionCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function readSessionFromRequest(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  const token = match?.slice(COOKIE_NAME.length + 1);
  return verifySessionToken(token);
}

import { NextResponse } from "next/server";
import {
  buildSessionCookie,
  getAdminCredentials,
  verifyAdminCredentials,
  createSessionToken,
} from "@/lib/admin/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!getAdminCredentials()) {
    return NextResponse.json(
      {
        error:
          "Admin credentials are not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD in your host environment variables, then redeploy.",
      },
      { status: 503 },
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";

  if (!verifyAdminCredentials(username, password)) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 },
    );
  }

  const token = createSessionToken(username);
  const res = NextResponse.json({ ok: true, username });
  res.headers.set("Set-Cookie", buildSessionCookie(token));
  return res;
}

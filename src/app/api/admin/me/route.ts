import { NextResponse } from "next/server";
import {
  buildSessionCookie,
  createSessionToken,
  getAdminCredentials,
  readSessionFromRequest,
} from "@/lib/admin/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = readSessionFromRequest(request);
  if (!session.ok) {
    return NextResponse.json(
      {
        authenticated: false,
        credentialsConfigured: Boolean(getAdminCredentials()),
      },
      { status: 401 },
    );
  }

  const res = NextResponse.json({
    authenticated: true,
    username: session.username,
    credentialsConfigured: true,
  });
  res.headers.set(
    "Set-Cookie",
    buildSessionCookie(createSessionToken(session.username)),
  );
  return res;
}

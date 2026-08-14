import { NextResponse } from "next/server";
import {
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

  return NextResponse.json({
    authenticated: true,
    username: session.username,
    credentialsConfigured: true,
  });
}

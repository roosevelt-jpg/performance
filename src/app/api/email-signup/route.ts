import { NextResponse } from "next/server";
import { subscribeEmail } from "@/lib/email/subscribe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const result = await subscribeEmail(body.email ?? "");
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, mocked: result.mocked ?? false });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Signup failed. Try again.",
      },
      { status: 502 },
    );
  }
}

export type ChallengePaidSession = {
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  customerDetails?: {
    email?: string | null;
    name?: string | null;
    phone?: string | null;
  } | null;
  metadata?: Record<string, string> | null;
};

export function isChallengeCheckout(session: ChallengePaidSession): boolean {
  return session.metadata?.product === "8-week-challenge";
}

export function challengePaidContact(session: ChallengePaidSession): {
  email: string;
  name: string;
  phone: string;
  tags: string[];
} | null {
  if (!isChallengeCheckout(session)) return null;
  const email = (
    session.customerDetails?.email ||
    session.email ||
    ""
  ).trim();
  if (!email) return null;
  return {
    email,
    name: (session.customerDetails?.name || session.name || "").trim(),
    phone: (session.customerDetails?.phone || session.phone || "").trim(),
    tags: ["paid_challenge", "stripe_challenge", "funnel_apply"],
  };
}

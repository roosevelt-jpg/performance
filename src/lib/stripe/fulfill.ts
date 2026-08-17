export type PaidSession = {
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

export type PaidLead = {
  email: string;
  name: string;
  phone: string;
  tags: string[];
  source: string;
  product: string;
};

function contactFrom(session: PaidSession) {
  const email = (
    session.customerDetails?.email ||
    session.email ||
    ""
  ).trim();
  return {
    email,
    name: (session.customerDetails?.name || session.name || "").trim(),
    phone: (session.customerDetails?.phone || session.phone || "").trim(),
  };
}

export function productKey(session: PaidSession): string {
  return (
    session.metadata?.product ||
    session.metadata?.cmsTierId ||
    ""
  ).trim();
}

export function isChallengeCheckout(session: PaidSession): boolean {
  const product = productKey(session);
  return product === "8-week-challenge" || product === "challenge";
}

export function challengePaidContact(session: PaidSession): PaidLead | null {
  if (!isChallengeCheckout(session)) return null;
  const contact = contactFrom(session);
  if (!contact.email) return null;
  return {
    ...contact,
    tags: ["paid_challenge", "stripe_challenge", "funnel_apply"],
    source: "stripe_challenge",
    product: "challenge",
  };
}

export function paidLeadFromSession(session: PaidSession): PaidLead | null {
  const challenge = challengePaidContact(session);
  if (challenge) return challenge;
  const contact = contactFrom(session);
  if (!contact.email) return null;
  const product = productKey(session);
  if (!product) {
    return {
      ...contact,
      tags: ["stripe_paid"],
      source: "stripe",
      product: "",
    };
  }
  const tierId = product === "8-week-challenge" ? "challenge" : product;
  return {
    ...contact,
    tags: ["stripe_paid", `paid_${tierId}`],
    source: "stripe",
    product: tierId,
  };
}

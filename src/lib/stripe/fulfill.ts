import {
  buildCheckoutWrite,
  type ProgrammePurchaseWrite,
} from "@/lib/crm/programmeCutover";

export type PaidSession = {
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  customer?: string | { id?: string | null } | null;
  subscription?: string | { id?: string | null } | null;
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

function idOf(
  value: string | { id?: string | null } | null | undefined,
): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  return (value.id || "").trim();
}

export function productKey(session: PaidSession): string {
  return (
    session.metadata?.cmsTierId ||
    session.metadata?.product ||
    ""
  ).trim();
}

export function isChallengeCheckout(session: PaidSession): boolean {
  const product = productKey(session);
  return product === "8-week-challenge" || product === "challenge";
}

/** Full GHL cutover write for a paid Checkout Session. */
export function programmePurchaseFromSession(
  session: PaidSession,
): ProgrammePurchaseWrite | null {
  const contact = contactFrom(session);
  const product = productKey(session);
  const tierId =
    product === "8-week-challenge"
      ? "challenge"
      : product || (contact.email ? "challenge" : "");
  if (!contact.email || !tierId) return null;

  return buildCheckoutWrite({
    email: contact.email,
    name: contact.name,
    phone: contact.phone,
    tierId,
    stripeCustomerId: idOf(session.customer),
    stripeSubscriptionId: idOf(session.subscription),
    source: isChallengeCheckout(session)
      ? "stripe_challenge"
      : "stripe_checkout",
  });
}

export function challengePaidContact(session: PaidSession): PaidLead | null {
  if (!isChallengeCheckout(session)) return null;
  const purchase = programmePurchaseFromSession(session);
  if (!purchase) return null;
  return {
    email: purchase.email,
    name: purchase.name,
    phone: purchase.phone,
    tags: purchase.tagsAdd,
    source: purchase.source,
    product: "challenge",
  };
}

export function paidLeadFromSession(session: PaidSession): PaidLead | null {
  const purchase = programmePurchaseFromSession(session);
  if (!purchase) return null;
  return {
    email: purchase.email,
    name: purchase.name,
    phone: purchase.phone,
    tags: purchase.tagsAdd,
    source: purchase.source,
    product: purchase.tierId,
  };
}

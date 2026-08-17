export type PurchaseRow = {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  productName: string;
  tierId: string;
  receiptUrl: string;
  sessionId: string;
  paymentIntentId: string;
  livemode: boolean;
};

export type PurchaseSummary = {
  count: number;
  gross: number;
  currency: string;
  livemode: boolean;
};

type ChargeLike = {
  id?: string;
  receipt_url?: string | null;
};

type PaymentIntentLike = {
  id?: string;
  latest_charge?: string | ChargeLike | null;
};

export type CheckoutSessionLike = {
  id: string;
  created: number;
  amount_total?: number | null;
  currency?: string | null;
  payment_status?: string | null;
  status?: string | null;
  livemode?: boolean;
  metadata?: Record<string, string> | null;
  customer_details?: {
    email?: string | null;
    name?: string | null;
  } | null;
  customer_email?: string | null;
  payment_intent?: string | PaymentIntentLike | null;
  payment_link?: string | { id?: string } | null;
  line_items?: {
    data?: Array<{ description?: string | null }>;
  } | null;
};

function chargeFromIntent(
  intent: string | PaymentIntentLike | null | undefined,
): ChargeLike | null {
  if (!intent || typeof intent === "string") return null;
  if (!intent.latest_charge || typeof intent.latest_charge === "string") {
    return null;
  }
  return intent.latest_charge;
}

export function mapCheckoutSession(session: CheckoutSessionLike): PurchaseRow {
  const intent =
    session.payment_intent && typeof session.payment_intent !== "string"
      ? session.payment_intent
      : null;
  const charge = chargeFromIntent(session.payment_intent);
  const productFromLines = session.line_items?.data?.[0]?.description?.trim();
  const tierId = session.metadata?.cmsTierId || session.metadata?.product || "";
  const productName =
    productFromLines ||
    (tierId === "8-week-challenge" ? "8-Week Challenge" : tierId) ||
    "Stripe payment";

  return {
    id: session.id,
    createdAt: new Date(session.created * 1000).toISOString(),
    customerName: session.customer_details?.name?.trim() || "",
    customerEmail:
      session.customer_details?.email?.trim() ||
      session.customer_email?.trim() ||
      "",
    amount: session.amount_total ?? 0,
    currency: (session.currency || "gbp").toLowerCase(),
    status: session.status || "",
    paymentStatus: session.payment_status || "",
    productName,
    tierId: tierId === "8-week-challenge" ? "challenge" : tierId,
    receiptUrl: charge?.receipt_url || "",
    sessionId: session.id,
    paymentIntentId:
      (typeof session.payment_intent === "string"
        ? session.payment_intent
        : intent?.id) || "",
    livemode: Boolean(session.livemode),
  };
}

export function summarizePurchases(rows: PurchaseRow[]): PurchaseSummary {
  const paid = rows.filter(
    (row) => row.paymentStatus === "paid" || row.status === "complete",
  );
  const currency = paid[0]?.currency || rows[0]?.currency || "gbp";
  return {
    count: paid.length,
    gross: paid
      .filter((row) => row.currency === currency)
      .reduce((sum, row) => sum + row.amount, 0),
    currency,
    livemode: rows.some((row) => row.livemode),
  };
}

export function formatStripeMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

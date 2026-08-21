export type PaymentLinkRef = {
  id: string;
  url: string;
};

const PLINK = /plink_[A-Za-z0-9]+/;

export function parsePaymentLinkRef(raw: string): PaymentLinkRef {
  const value = raw.trim();
  const idMatch = value.match(PLINK);
  if (idMatch) {
    return { id: idMatch[0], url: value.startsWith("http") ? value : "" };
  }
  return {
    id: "",
    url: value.startsWith("http") ? value : "",
  };
}

export function paymentLinkMatches(
  listed: { id: string; url?: string | null },
  ref: PaymentLinkRef,
): boolean {
  if (ref.id && listed.id === ref.id) return true;
  if (!ref.url || !listed.url) return false;
  try {
    const a = new URL(ref.url);
    const b = new URL(listed.url);
    return a.origin === b.origin && a.pathname === b.pathname;
  } catch {
    return listed.url === ref.url;
  }
}

export function productMetadata(tierId: string, applicationOnly: boolean) {
  return {
    cmsTierId: tierId,
    product: tierId === "challenge" ? "8-week-challenge" : tierId,
    applicationOnly: applicationOnly ? "true" : "false",
    track: "B",
    cutover: "programme",
  };
}

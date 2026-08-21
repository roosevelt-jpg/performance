/**
 * Shared anchors between Admin → Integrations sections and Admin → Status probes/checks.
 */

export type ProbeTarget =
  | "storage"
  | "ghl"
  | "calendar"
  | "stripe"
  | "gmail"
  | "youtube";

export type IntegrationSectionLink = {
  /** DOM id on /admin/integrations */
  id: string;
  label: string;
  /** Hash target on /admin/status */
  statusHash: string;
  /** buildChecks group, when applicable */
  checkGroup?:
    | "crm"
    | "calendar"
    | "pricing"
    | "product"
    | "security"
    | "media"
    | "email"
    | "reviews"
    | "seo"
    | "payments"
    | "messaging"
    | "ai";
  /** Live probe id, when a live test exists */
  probe?: ProbeTarget;
};

export const INTEGRATION_SECTIONS: IntegrationSectionLink[] = [
  {
    id: "integration-ghl",
    label: "GoHighLevel CRM",
    statusHash: "probe-ghl",
    checkGroup: "crm",
    probe: "ghl",
  },
  {
    id: "integration-youtube",
    label: "YouTube Data API",
    statusHash: "probe-youtube",
    checkGroup: "media",
    probe: "youtube",
  },
  {
    id: "integration-seo",
    label: "Google search & measurement",
    statusHash: "check-seo",
    checkGroup: "seo",
  },
  {
    id: "integration-email",
    label: "Email signup",
    statusHash: "check-email",
    checkGroup: "email",
  },
  {
    id: "integration-shopify",
    label: "Shopify",
    statusHash: "check-product",
    checkGroup: "product",
  },
  {
    id: "integration-reviews",
    label: "Reviews",
    statusHash: "check-reviews",
    checkGroup: "reviews",
  },
  {
    id: "integration-calendar",
    label: "Calendar",
    statusHash: "probe-calendar",
    checkGroup: "calendar",
    probe: "calendar",
  },
  {
    id: "integration-pricing",
    label: "Pricing (Q9)",
    statusHash: "check-pricing",
    checkGroup: "pricing",
  },
  {
    id: "integration-product",
    label: "Product",
    statusHash: "check-product",
    checkGroup: "product",
  },
  {
    id: "integration-stripe",
    label: "Stripe",
    statusHash: "probe-stripe",
    checkGroup: "payments",
    probe: "stripe",
  },
  {
    id: "integration-dna",
    label: "DNA report delivery",
    statusHash: "probe-gmail",
    checkGroup: "email",
    probe: "gmail",
  },
];

export function sectionById(id: string): IntegrationSectionLink | undefined {
  return INTEGRATION_SECTIONS.find((s) => s.id === id);
}

export function sectionByProbe(
  probe: ProbeTarget,
): IntegrationSectionLink | undefined {
  return INTEGRATION_SECTIONS.find((s) => s.probe === probe);
}

export function sectionByCheckGroup(
  group: string,
): IntegrationSectionLink | undefined {
  if (group === "messaging" || group === "ai") {
    return INTEGRATION_SECTIONS.find((s) => s.id === "integration-dna");
  }
  return INTEGRATION_SECTIONS.find((s) => s.checkGroup === group);
}

export function integrationsHref(sectionId: string): string {
  return `/admin/integrations#${sectionId}`;
}

export function statusHref(hash: string): string {
  return `/admin/status#${hash}`;
}

export function scrollToHash(hash: string) {
  if (typeof document === "undefined") return;
  const id = hash.replace(/^#/, "");
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  el.classList.add("ring-1", "ring-[var(--accent)]");
  window.setTimeout(() => {
    el.classList.remove("ring-1", "ring-[var(--accent)]");
  }, 1800);
}

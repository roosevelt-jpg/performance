/** Hostname only — accepts paste of https://theformulaperformance.com/ */
export function normalizeStoreDomain(input: string | undefined | null): string {
  const raw = (input ?? "").trim();
  if (!raw) return "";
  try {
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(withProto).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return raw
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "")
      .replace(/^www\./i, "")
      .toLowerCase();
  }
}

/** Strip tags so CMS copy stays plain text. */
export function toPlainText(input: string): string {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

export function sanitizePlainDeep<T>(value: T): T {
  if (typeof value === "string") {
    return toPlainText(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizePlainDeep(item)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = sanitizePlainDeep(nested);
    }
    return out as T;
  }
  return value;
}

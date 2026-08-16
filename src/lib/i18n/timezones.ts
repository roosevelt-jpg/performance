/**
 * IANA time zones from the runtime. Kane's working hours stay in the
 * zone he picks; applicants can display slots in any of these.
 */
export function ianaTimeZones(): string[] {
  if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
    try {
      return [...Intl.supportedValuesOf("timeZone")];
    } catch {
      /* fall through */
    }
  }
  return FALLBACK_TIMEZONES;
}

export function isValidTimeZone(value: string | undefined | null): boolean {
  const zone = value?.trim();
  if (!zone) return false;
  try {
    Intl.DateTimeFormat("en-US", { timeZone: zone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function timezoneRegion(zone: string): string {
  const slash = zone.indexOf("/");
  return slash === -1 ? "Other" : zone.slice(0, slash).replaceAll("_", " ");
}

export function groupTimeZones(
  zones: string[] = ianaTimeZones(),
): Array<{ region: string; zones: string[] }> {
  const map = new Map<string, string[]>();
  for (const zone of zones) {
    const region = timezoneRegion(zone);
    const list = map.get(region) ?? [];
    list.push(zone);
    map.set(region, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([region, list]) => ({ region, zones: list }));
}

export function timezoneOffsetLabel(zone: string, at = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: zone,
      timeZoneName: "shortOffset",
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(at);
    return (
      parts.find((part) => part.type === "timeZoneName")?.value ?? ""
    );
  } catch {
    return "";
  }
}

export function timezoneOptionLabel(zone: string): string {
  const offset = timezoneOffsetLabel(zone);
  const city = zone.replaceAll("_", " ");
  return offset ? `${city} (${offset})` : city;
}

/** Used only if Intl.supportedValuesOf is missing. */
const FALLBACK_TIMEZONES = [
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Africa/Lagos",
  "Africa/Nairobi",
  "America/Argentina/Buenos_Aires",
  "America/Bogota",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Mexico_City",
  "America/New_York",
  "America/Sao_Paulo",
  "America/Toronto",
  "Asia/Dubai",
  "Asia/Hong_Kong",
  "Asia/Kolkata",
  "Asia/Riyadh",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Perth",
  "Australia/Sydney",
  "Europe/Amsterdam",
  "Europe/Berlin",
  "Europe/Istanbul",
  "Europe/Lisbon",
  "Europe/London",
  "Europe/Madrid",
  "Europe/Paris",
  "Europe/Rome",
  "Pacific/Auckland",
  "UTC",
];

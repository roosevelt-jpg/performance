"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  IntegrationCheck,
  IntegrationsConfig,
} from "@/lib/integrations/types";
import { DEFAULT_INTEGRATIONS } from "@/lib/integrations/types";

type ApiPayload = {
  config: IntegrationsConfig;
  secretsSet: {
    ghlApiKey: boolean;
    adminCredentials: boolean;
    youtubeApiKey: boolean;
    emailApiKey: boolean;
    shopifyToken: boolean;
    judgemeToken: boolean;
    calendlyApiToken: boolean;
    googleClientSecret: boolean;
    googleRefreshToken: boolean;
    googleServiceAccount: boolean;
  };
  checks: IntegrationCheck[];
  readyForLive: boolean;
  storage: { fileExists: boolean; path: string; writable: boolean };
  envSnippet?: string;
  error?: string;
};

function statusColor(status: IntegrationCheck["status"]) {
  if (status === "ready") return "text-[var(--accent)]";
  if (status === "missing") return "text-red-400";
  return "text-[var(--muted)]";
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-[var(--fg)]">{label}</span>
      {hint ? (
        <span className="block text-xs text-[var(--muted)]">{hint}</span>
      ) : null}
      {children}
    </label>
  );
}

const inputClass =
  "mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-base text-[var(--fg)] outline-none focus:border-[var(--accent)] sm:text-sm";

const jsonHeaders = { "Content-Type": "application/json" };

export function IntegrationsAdmin({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiPayload | null>(null);
  const [form, setForm] = useState<IntegrationsConfig>(DEFAULT_INTEGRATIONS);
  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const [youtubeKeyDraft, setYoutubeKeyDraft] = useState("");
  const [emailKeyDraft, setEmailKeyDraft] = useState("");
  const [shopifyTokenDraft, setShopifyTokenDraft] = useState("");
  const [judgemeTokenDraft, setJudgemeTokenDraft] = useState("");
  const [calendlyTokenDraft, setCalendlyTokenDraft] = useState("");
  const [googleSecretDraft, setGoogleSecretDraft] = useState("");
  const [googleRefreshDraft, setGoogleRefreshDraft] = useState("");
  const [googleSaDraft, setGoogleSaDraft] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!embedded) {
        const me = await fetch("/api/admin/me", { credentials: "include" });
        if (!me.ok) {
          router.replace("/admin/login?next=/admin/integrations");
          return;
        }
        const meJson = (await me.json()) as { username?: string };
        setUsername(meJson.username ?? "admin");
      }

      const res = await fetch("/api/integrations", {
        credentials: "include",
        headers: jsonHeaders,
      });
      const json = (await res.json()) as ApiPayload;
      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/admin/login?next=/admin/integrations");
          return;
        }
        setError(json.error ?? "Failed to load");
        setData(null);
        return;
      }
      setData(json);
      setForm(json.config);
      setApiKeyDraft("");
      setYoutubeKeyDraft("");
      setEmailKeyDraft("");
      setShopifyTokenDraft("");
      setJudgemeTokenDraft("");
      setCalendlyTokenDraft("");
      setGoogleSecretDraft("");
      setGoogleRefreshDraft("");
      setGoogleSaDraft("");
    } catch {
      setError("Failed to load integrations");
    } finally {
      setLoading(false);
    }
  }, [router, embedded]);

  useEffect(() => {
    void load();
  }, [load]);

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "include",
    });
    router.replace("/admin/login");
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const payload: IntegrationsConfig = {
        ...form,
        ghl: {
          ...form.ghl,
          apiKey: apiKeyDraft.trim() || form.ghl.apiKey,
        },
        youtube: {
          ...form.youtube,
          apiKey: youtubeKeyDraft.trim() || form.youtube.apiKey,
        },
        email: {
          ...form.email,
          apiKey: emailKeyDraft.trim() || form.email.apiKey,
        },
        shopify: {
          ...form.shopify,
          storefrontToken:
            shopifyTokenDraft.trim() || form.shopify.storefrontToken,
        },
        reviews: {
          ...form.reviews,
          judgemeApiToken:
            judgemeTokenDraft.trim() || form.reviews.judgemeApiToken,
        },
        calendar: {
          ...form.calendar,
          calendlyApiToken:
            calendlyTokenDraft.trim() || form.calendar.calendlyApiToken,
          googleClientSecret:
            googleSecretDraft.trim() || form.calendar.googleClientSecret,
          googleRefreshToken:
            googleRefreshDraft.trim() || form.calendar.googleRefreshToken,
          googleServiceAccountJson:
            googleSaDraft.trim() || form.calendar.googleServiceAccountJson,
        },
      };
      const res = await fetch("/api/integrations", {
        method: "PUT",
        credentials: "include",
        headers: jsonHeaders,
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as ApiPayload & { ok?: boolean };
      if (!res.ok) {
        setError(json.error ?? "Save failed");
        return;
      }
      setData(json);
      setForm(json.config);
      setApiKeyDraft("");
      setYoutubeKeyDraft("");
      setEmailKeyDraft("");
      setShopifyTokenDraft("");
      setJudgemeTokenDraft("");
      setCalendlyTokenDraft("");
      setGoogleSecretDraft("");
      setGoogleRefreshDraft("");
      setGoogleSaDraft("");
      setMessage("Saved to data/integrations.local.json");
    } catch {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function test(target: "ghl" | "calendar" | "youtube") {
    setTesting(target);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/integrations/test", {
        method: "POST",
        credentials: "include",
        headers: jsonHeaders,
        body: JSON.stringify({ target }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        locationName?: string;
        message?: string;
      };
      if (!json.ok) {
        setError(json.error ?? "Test failed");
        return;
      }
      setMessage(
        target === "ghl"
          ? `GHL OK${json.locationName ? ` — ${json.locationName}` : ""}`
          : (json.message ?? "Connection OK"),
      );
    } catch {
      setError("Test failed");
    } finally {
      setTesting(null);
    }
  }

  function copyEnv() {
    if (!data?.envSnippet) return;
    void navigator.clipboard.writeText(data.envSnippet);
    setMessage("Copied .env snippet to clipboard");
  }

  const grouped = useMemo(() => {
    const checks = data?.checks ?? [];
    return {
      security: checks.filter((c) => c.group === "security"),
      crm: checks.filter((c) => c.group === "crm"),
      calendar: checks.filter((c) => c.group === "calendar"),
      pricing: checks.filter((c) => c.group === "pricing"),
      product: checks.filter((c) => c.group === "product"),
      media: checks.filter((c) => c.group === "media"),
      email: checks.filter((c) => c.group === "email"),
      reviews: checks.filter((c) => c.group === "reviews"),
    };
  }, [data]);

  return (
    <div
      className={
        embedded
          ? "w-full"
          : "mx-auto w-full max-w-4xl px-4 py-6 sm:py-10 lg:px-6 lg:py-14"
      }
    >
      {!embedded ? (
        <header className="mb-6 flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:mb-8 sm:pb-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
              Pre go-live
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--fg)] sm:text-3xl">
              Integrations
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
              Configure CRM, calendar, and pricing APIs before launch. Values
              save to a local config file; export to env for production hosting.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm sm:gap-4">
            {username ? (
              <span className="max-w-full truncate text-[var(--muted)]">
                Signed in as {username}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => void logout()}
              className="text-[var(--muted)] hover:text-[var(--accent)]"
            >
              Sign out
            </button>
            <Link
              href="/"
              className="text-[var(--muted)] hover:text-[var(--accent)]"
            >
              ← Back to site
            </Link>
          </div>
        </header>
      ) : null}

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      ) : null}

      {error ? (
        <p className="mb-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mb-4 text-sm text-[var(--accent)]">{message}</p>
      ) : null}

      {data ? (
        <>
          <div
            className={[
              "mb-8 rounded-lg border p-5",
              data.readyForLive
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--border)] bg-[var(--surface)]",
            ].join(" ")}
          >
            <p className="text-sm font-semibold text-[var(--fg)]">
              {data.readyForLive
                ? "Ready for live — all required integrations are set."
                : "Not ready — finish the missing items below."}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Storage: {data.storage.path}
              {data.storage.fileExists ? " (file present)" : " (no file yet)"}
              {data.storage.writable ? "" : " · read-only host"}
            </p>
            <ul className="mt-4 space-y-2">
              {(
                [
                  "security",
                  "crm",
                  "calendar",
                  "media",
                  "email",
                  "reviews",
                  "pricing",
                  "product",
                ] as const
              ).map((group) =>
                grouped[group].map((check) => (
                  <li
                    key={check.id}
                    className="flex flex-col gap-1 text-sm sm:flex-row sm:items-start sm:justify-between sm:gap-3"
                  >
                    <span className="text-[var(--fg-soft)]">{check.label}</span>
                    <span
                      className={`font-medium sm:shrink-0 sm:text-right ${statusColor(check.status)}`}
                    >
                      {check.status}
                      {check.detail ? ` · ${check.detail}` : ""}
                    </span>
                  </li>
                )),
              )}
            </ul>
          </div>

          <div className="space-y-8">
            <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-[var(--fg)]">
                  GoHighLevel CRM
                </h2>
                <button
                  type="button"
                  onClick={() => test("ghl")}
                  disabled={testing === "ghl"}
                  className="w-full rounded-md border border-[var(--border)] px-3 py-2.5 text-xs font-semibold text-[var(--fg)] hover:border-[var(--accent)] sm:w-auto sm:py-1.5"
                >
                  {testing === "ghl" ? "Testing…" : "Test connection"}
                </button>
              </div>
              <Field
                label="API key"
                hint={
                  data.secretsSet.ghlApiKey
                    ? "Saved (masked). Paste a new key only to replace."
                    : "Required for contact upsert, apply-chat automations, and WhatsApp opt-in."
                }
              >
                <input
                  type="password"
                  className={inputClass}
                  value={apiKeyDraft}
                  onChange={(e) => setApiKeyDraft(e.target.value)}
                  placeholder={
                    data.secretsSet.ghlApiKey
                      ? String(form.ghl.apiKey)
                      : "pit-…"
                  }
                  autoComplete="off"
                />
              </Field>
              <Field label="Location ID">
                <input
                  className={inputClass}
                  value={form.ghl.locationId}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      ghl: { ...f.ghl, locationId: e.target.value },
                    }))
                  }
                />
              </Field>
              <Field label="API base URL">
                <input
                  className={inputClass}
                  value={form.ghl.apiBaseUrl}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      ghl: { ...f.ghl, apiBaseUrl: e.target.value },
                    }))
                  }
                />
              </Field>
              <Field
                label="Qualified workflow ID"
                hint="Optional. After a Pro/Elite apply qualifies, GHL starts this workflow. You can also trigger from the tag funnel_qualified."
              >
                <input
                  className={inputClass}
                  value={form.ghl.workflowQualifiedId ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      ghl: { ...f.ghl, workflowQualifiedId: e.target.value },
                    }))
                  }
                  placeholder="workflow id from GHL"
                />
              </Field>
              <Field
                label="Not-a-fit workflow ID"
                hint="Optional. Fires when they go to the Challenge. Tag: funnel_disqualified."
              >
                <input
                  className={inputClass}
                  value={form.ghl.workflowDisqualifiedId ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      ghl: { ...f.ghl, workflowDisqualifiedId: e.target.value },
                    }))
                  }
                  placeholder="workflow id from GHL"
                />
              </Field>
            </section>

            <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-[var(--fg)]">
                  YouTube Data API
                </h2>
                <button
                  type="button"
                  onClick={() => test("youtube")}
                  disabled={testing === "youtube"}
                  className="w-full rounded-md border border-[var(--border)] px-3 py-2.5 text-xs font-semibold text-[var(--fg)] hover:border-[var(--accent)] sm:w-auto sm:py-1.5"
                >
                  {testing === "youtube" ? "Testing…" : "Test connection"}
                </button>
              </div>
              <Field
                label="API key"
                hint={
                  data.secretsSet.youtubeApiKey
                    ? "Saved (masked). Paste a new key only to replace."
                    : "From Google Cloud — YouTube Data API v3. Used to validate video IDs."
                }
              >
                <input
                  type="password"
                  className={inputClass}
                  value={youtubeKeyDraft}
                  onChange={(e) => setYoutubeKeyDraft(e.target.value)}
                  placeholder={
                    data.secretsSet.youtubeApiKey
                      ? String(form.youtube.apiKey)
                      : "AIza…"
                  }
                  autoComplete="off"
                />
              </Field>
              <Field label="Channel ID" hint="Optional. UC… from YouTube Studio.">
                <input
                  className={inputClass}
                  value={form.youtube.channelId}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      youtube: { ...f.youtube, channelId: e.target.value },
                    }))
                  }
                />
              </Field>
            </section>

            <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-lg font-semibold text-[var(--fg)]">
                Email signup
              </h2>
              <Field
                label="Provider"
                hint="Popup signups on the landing page go here. GHL uses the CRM key above."
              >
                <select
                  className={inputClass}
                  value={form.email.provider}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      email: {
                        ...f.email,
                        provider: e.target.value as IntegrationsConfig["email"]["provider"],
                      },
                    }))
                  }
                >
                  <option value="ghl">GoHighLevel</option>
                  <option value="mailchimp">Mailchimp</option>
                  <option value="klaviyo">Klaviyo</option>
                  <option value="none">Off</option>
                </select>
              </Field>
              {form.email.provider === "mailchimp" ||
              form.email.provider === "klaviyo" ? (
                <>
                  <Field
                    label="API key"
                    hint={
                      data.secretsSet.emailApiKey
                        ? "Saved (masked). Paste a new key only to replace."
                        : undefined
                    }
                  >
                    <input
                      type="password"
                      className={inputClass}
                      value={emailKeyDraft}
                      onChange={(e) => setEmailKeyDraft(e.target.value)}
                      autoComplete="off"
                    />
                  </Field>
                  <Field label="List / audience ID">
                    <input
                      className={inputClass}
                      value={form.email.listId}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          email: { ...f.email, listId: e.target.value },
                        }))
                      }
                    />
                  </Field>
                </>
              ) : null}
              {form.email.provider === "mailchimp" ? (
                <Field
                  label="Server prefix"
                  hint="The us13 in us13.api.mailchimp.com"
                >
                  <input
                    className={inputClass}
                    value={form.email.serverPrefix}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        email: { ...f.email, serverPrefix: e.target.value },
                      }))
                    }
                    placeholder="us13"
                  />
                </Field>
              ) : null}
            </section>

            <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-lg font-semibold text-[var(--fg)]">
                Shopify
              </h2>
              <Field label="Store domain">
                <input
                  className={inputClass}
                  value={form.shopify.storeDomain}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      shopify: { ...f.shopify, storeDomain: e.target.value },
                    }))
                  }
                />
              </Field>
              <Field
                label="Storefront token"
                hint={
                  data.secretsSet.shopifyToken
                    ? "Saved (masked). Optional unless you embed Storefront APIs."
                    : "Optional. Challenge checkout still uses the product URL below."
                }
              >
                <input
                  type="password"
                  className={inputClass}
                  value={shopifyTokenDraft}
                  onChange={(e) => setShopifyTokenDraft(e.target.value)}
                  autoComplete="off"
                />
              </Field>
            </section>

            <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-lg font-semibold text-[var(--fg)]">
                Reviews
              </h2>
              <Field
                label="Provider"
                hint="Internal uses CMS testimonials in the reviews popup."
              >
                <select
                  className={inputClass}
                  value={form.reviews.provider}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      reviews: {
                        ...f.reviews,
                        provider: e.target.value as "internal" | "judgeme",
                      },
                    }))
                  }
                >
                  <option value="internal">CMS testimonials</option>
                  <option value="judgeme">Judge.me</option>
                </select>
              </Field>
              {form.reviews.provider === "judgeme" ? (
                <>
                  <Field label="Shop domain">
                    <input
                      className={inputClass}
                      value={form.reviews.judgemeShopDomain}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          reviews: {
                            ...f.reviews,
                            judgemeShopDomain: e.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                  <Field
                    label="Private API token"
                    hint={
                      data.secretsSet.judgemeToken
                        ? "Saved (masked)."
                        : undefined
                    }
                  >
                    <input
                      type="password"
                      className={inputClass}
                      value={judgemeTokenDraft}
                      onChange={(e) => setJudgemeTokenDraft(e.target.value)}
                      autoComplete="off"
                    />
                  </Field>
                </>
              ) : null}
            </section>

            <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-[var(--fg)]">
                  Calendar
                </h2>
                <button
                  type="button"
                  onClick={() => test("calendar")}
                  disabled={testing === "calendar"}
                  className="w-full rounded-md border border-[var(--border)] px-3 py-2.5 text-xs font-semibold text-[var(--fg)] hover:border-[var(--accent)] sm:w-auto sm:py-1.5"
                >
                  {testing === "calendar" ? "Checking…" : "Test connection"}
                </button>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Applicants see a live availability calendar after they qualify.
                Connect Google Calendar or Calendly here so booked times write
                back and stay in sync. Embed URLs remain as a fallback.
              </p>
              <Field
                label="Provider"
                hint="Google Calendar is the native book-and-sync path. Calendly needs a paid plan for API booking."
              >
                <select
                  className={inputClass}
                  value={form.calendar.platform}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      calendar: {
                        ...f.calendar,
                        platform: e.target.value as
                          | "ghl"
                          | "calendly"
                          | "google",
                      },
                    }))
                  }
                >
                  <option value="google">Google Calendar</option>
                  <option value="calendly">Calendly</option>
                  <option value="ghl">GoHighLevel</option>
                </select>
              </Field>
              <Field
                label="Booking UI"
                hint="Auto uses the native calendar when an API is connected, otherwise the embed."
              >
                <select
                  className={inputClass}
                  value={form.calendar.bookingMode}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      calendar: {
                        ...f.calendar,
                        bookingMode: e.target.value as
                          | "auto"
                          | "native"
                          | "embed",
                      },
                    }))
                  }
                >
                  <option value="auto">Auto (native if API is set)</option>
                  <option value="native">Native availability only</option>
                  <option value="embed">Embed iframe only</option>
                </select>
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Timezone">
                  <input
                    className={inputClass}
                    value={form.calendar.timezone}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        calendar: { ...f.calendar, timezone: e.target.value },
                      }))
                    }
                    placeholder="Europe/London"
                  />
                </Field>
                <Field label="Days ahead">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    className={inputClass}
                    value={form.calendar.daysAhead}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        calendar: {
                          ...f.calendar,
                          daysAhead: Number(e.target.value),
                        },
                      }))
                    }
                  />
                </Field>
                <Field label="Hours start">
                  <input
                    className={inputClass}
                    value={form.calendar.workingHoursStart}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        calendar: {
                          ...f.calendar,
                          workingHoursStart: e.target.value,
                        },
                      }))
                    }
                    placeholder="09:00"
                  />
                </Field>
                <Field label="Hours end">
                  <input
                    className={inputClass}
                    value={form.calendar.workingHoursEnd}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        calendar: {
                          ...f.calendar,
                          workingHoursEnd: e.target.value,
                        },
                      }))
                    }
                    placeholder="17:00"
                  />
                </Field>
                <Field label="Buffer (minutes)">
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={form.calendar.bufferMinutes}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        calendar: {
                          ...f.calendar,
                          bufferMinutes: Number(e.target.value),
                        },
                      }))
                    }
                  />
                </Field>
                <Field label="Minimum notice (hours)">
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={form.calendar.minNoticeHours}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        calendar: {
                          ...f.calendar,
                          minNoticeHours: Number(e.target.value),
                        },
                      }))
                    }
                  />
                </Field>
              </div>
              <fieldset>
                <legend className="text-sm font-medium text-[var(--fg)]">
                  Working days
                </legend>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-[var(--fg-soft)]">
                  {([
                    [1, "Mon"],
                    [2, "Tue"],
                    [3, "Wed"],
                    [4, "Thu"],
                    [5, "Fri"],
                    [6, "Sat"],
                    [7, "Sun"],
                  ] as const).map(([id, label]) => {
                    const checked = (form.calendar.workingDays ?? []).includes(id);
                    return (
                      <label key={id} className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="accent-[var(--accent)]"
                          checked={checked}
                          onChange={() =>
                            setForm((f) => {
                              const set = new Set(f.calendar.workingDays ?? []);
                              if (set.has(id)) set.delete(id);
                              else set.add(id);
                              return {
                                ...f,
                                calendar: {
                                  ...f.calendar,
                                  workingDays: [...set].sort((a, b) => a - b),
                                },
                              };
                            })
                          }
                        />
                        {label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {form.calendar.platform === "google" ? (
                <>
                  <Field
                    label="Google Calendar ID"
                    hint="Usually 'primary', or the calendar email. Share this calendar with a service account if you paste a JSON key."
                  >
                    <input
                      className={inputClass}
                      value={form.calendar.googleCalendarId}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          calendar: {
                            ...f.calendar,
                            googleCalendarId: e.target.value,
                          },
                        }))
                      }
                      placeholder="primary"
                    />
                  </Field>
                  <p className="text-xs font-medium text-[var(--fg)]">
                    OAuth (personal Google Calendar)
                  </p>
                  <Field label="Client ID">
                    <input
                      className={inputClass}
                      value={form.calendar.googleClientId}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          calendar: {
                            ...f.calendar,
                            googleClientId: e.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                  <Field
                    label="Client secret"
                    hint={
                      data.secretsSet.googleClientSecret
                        ? "Saved (masked). Paste a new value only to replace."
                        : undefined
                    }
                  >
                    <input
                      type="password"
                      className={inputClass}
                      value={googleSecretDraft}
                      onChange={(e) => setGoogleSecretDraft(e.target.value)}
                      autoComplete="off"
                    />
                  </Field>
                  <Field
                    label="Refresh token"
                    hint={
                      data.secretsSet.googleRefreshToken
                        ? "Saved (masked). Paste a new value only to replace."
                        : "From Google OAuth Playground: scope https://www.googleapis.com/auth/calendar"
                    }
                  >
                    <input
                      type="password"
                      className={inputClass}
                      value={googleRefreshDraft}
                      onChange={(e) => setGoogleRefreshDraft(e.target.value)}
                      autoComplete="off"
                    />
                  </Field>
                  <Field
                    label="Or paste service account JSON"
                    hint={
                      data.secretsSet.googleServiceAccount
                        ? "Saved (masked). Paste a new JSON only to replace."
                        : "Share Kane’s calendar with the service account email, then paste the JSON key."
                    }
                  >
                    <textarea
                      className={`${inputClass} min-h-28 font-mono text-xs`}
                      value={googleSaDraft}
                      onChange={(e) => setGoogleSaDraft(e.target.value)}
                      placeholder='{"type":"service_account", ...}'
                    />
                  </Field>
                </>
              ) : null}

              {form.calendar.platform === "calendly" ? (
                <>
                  <Field
                    label="Calendly API token"
                    hint={
                      data.secretsSet.calendlyApiToken
                        ? "Saved (masked). Paste a new token only to replace."
                        : "Personal access token. Native booking via POST /invitees needs a paid Calendly plan."
                    }
                  >
                    <input
                      type="password"
                      className={inputClass}
                      value={calendlyTokenDraft}
                      onChange={(e) => setCalendlyTokenDraft(e.target.value)}
                      autoComplete="off"
                    />
                  </Field>
                  <Field
                    label="Event type URI — Pro (20 min)"
                    hint="Full URI from Calendly, e.g. https://api.calendly.com/event_types/AAAA"
                  >
                    <input
                      className={inputClass}
                      value={form.calendar.calendlyEventTypePro}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          calendar: {
                            ...f.calendar,
                            calendlyEventTypePro: e.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                  <Field label="Event type URI — Elite (30 min)">
                    <input
                      className={inputClass}
                      value={form.calendar.calendlyEventTypeElite}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          calendar: {
                            ...f.calendar,
                            calendlyEventTypeElite: e.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                  <Field
                    label="Location kind (optional)"
                    hint="google_conference, zoom_conference, outbound_call, inbound_call — leave blank if the event type already has a location."
                  >
                    <input
                      className={inputClass}
                      value={form.calendar.calendlyLocationKind}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          calendar: {
                            ...f.calendar,
                            calendlyLocationKind: e.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                  <Field label="Embed fallback — Pro Call">
                    <input
                      className={inputClass}
                      value={form.calendar.calendlyEmbedPro}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          calendar: {
                            ...f.calendar,
                            calendlyEmbedPro: e.target.value,
                          },
                        }))
                      }
                      placeholder="https://calendly.com/…"
                    />
                  </Field>
                  <Field label="Embed fallback — Elite Call">
                    <input
                      className={inputClass}
                      value={form.calendar.calendlyEmbedElite}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          calendar: {
                            ...f.calendar,
                            calendlyEmbedElite: e.target.value,
                          },
                        }))
                      }
                      placeholder="https://calendly.com/…"
                    />
                  </Field>
                </>
              ) : null}

              {form.calendar.platform === "ghl" ? (
                <>
                  <Field
                    label="GHL calendar ID — Pro (20 min)"
                    hint="From GHL calendars. Used for live free-slots + booking when an API key is set."
                  >
                    <input
                      className={inputClass}
                      value={form.calendar.ghlCalendarIdPro}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          calendar: {
                            ...f.calendar,
                            ghlCalendarIdPro: e.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                  <Field label="GHL calendar ID — Elite (30 min)">
                    <input
                      className={inputClass}
                      value={form.calendar.ghlCalendarIdElite}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          calendar: {
                            ...f.calendar,
                            ghlCalendarIdElite: e.target.value,
                          },
                        }))
                      }
                    />
                  </Field>
                  <Field label="Embed fallback — Pro Call">
                    <input
                      className={inputClass}
                      value={form.calendar.ghlEmbedPro}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          calendar: {
                            ...f.calendar,
                            ghlEmbedPro: e.target.value,
                          },
                        }))
                      }
                      placeholder="https://…"
                    />
                  </Field>
                  <Field label="Embed fallback — Elite Call">
                    <input
                      className={inputClass}
                      value={form.calendar.ghlEmbedElite}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          calendar: {
                            ...f.calendar,
                            ghlEmbedElite: e.target.value,
                          },
                        }))
                      }
                      placeholder="https://…"
                    />
                  </Field>
                </>
              ) : null}
            </section>

            <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-lg font-semibold text-[var(--fg)]">
                Pricing (Q9 only — never on public cards)
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Pro £ / month">
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={form.pricing.pro}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        pricing: {
                          ...f.pricing,
                          pro: Number(e.target.value),
                        },
                      }))
                    }
                  />
                </Field>
                <Field label="Elite £ / month">
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={form.pricing.elite}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        pricing: {
                          ...f.pricing,
                          elite: Number(e.target.value),
                        },
                      }))
                    }
                  />
                </Field>
              </div>
            </section>

            <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-lg font-semibold text-[var(--fg)]">
                Product
              </h2>
              <Field label="Challenge checkout URL">
                <input
                  className={inputClass}
                  value={form.product.challengeCheckoutUrl}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      product: {
                        ...f.product,
                        challengeCheckoutUrl: e.target.value,
                      },
                    }))
                  }
                  placeholder="https://theformulaperformance.com/products/…"
                />
              </Field>
              <Field
                label="Checkout embed URL (optional)"
                hint="Paste a payment form / order-form iframe URL if you have one. Shopify product pages usually need the button link above."
              >
                <input
                  className={inputClass}
                  value={form.product.challengeCheckoutEmbedUrl}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      product: {
                        ...f.product,
                        challengeCheckoutEmbedUrl: e.target.value,
                      },
                    }))
                  }
                  placeholder="https://…"
                />
              </Field>
              <label className="flex items-start gap-3 text-sm text-[var(--fg-soft)]">
                <input
                  type="checkbox"
                  className="mt-1 accent-[var(--accent)]"
                  checked={form.product.challengeCheckoutOpenInNewTab}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      product: {
                        ...f.product,
                        challengeCheckoutOpenInNewTab: e.target.checked,
                      },
                    }))
                  }
                />
                <span>Open Challenge checkout in a new tab</span>
              </label>
              <label className="flex items-start gap-3 text-sm text-[var(--fg-soft)]">
                <input
                  type="checkbox"
                  className="mt-1 accent-[var(--accent)]"
                  checked={form.product.showEntryTier}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      product: {
                        ...f.product,
                        showEntryTier: e.target.checked,
                      },
                    }))
                  }
                />
                <span>
                  Show entry tier below Challenge (4th card — no booking CTA)
                </span>
              </label>
              <Field label="Internal notes">
                <textarea
                  className={`${inputClass} min-h-24`}
                  value={form.admin.notes}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      admin: { ...f.admin, notes: e.target.value },
                    }))
                  }
                  placeholder="e.g. GHL location name, who owns the Calendly account…"
                />
              </Field>
            </section>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={save}
              disabled={saving || !data.storage.writable}
              className="w-full rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-fg)] disabled:opacity-50 sm:w-auto sm:py-2.5"
            >
              {saving ? "Saving…" : "Save integrations"}
            </button>
            <button
              type="button"
              onClick={copyEnv}
              className="w-full rounded-md border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--fg)] sm:w-auto sm:py-2.5"
            >
              Copy as .env
            </button>
            <button
              type="button"
              onClick={() => void load()}
              className="w-full rounded-md border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--fg)] sm:w-auto sm:py-2.5"
            >
              Refresh
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

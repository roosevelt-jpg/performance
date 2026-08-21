"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { IntegrationCheck } from "@/lib/integrations/types";

type StatusPayload = {
  checks: IntegrationCheck[];
  readyForLive: boolean;
  secretsSet: Record<string, boolean>;
  storage: {
    fileExists: boolean;
    path: string;
    writable: boolean;
    durable?: boolean;
  };
  error?: string;
};

type LiveResult = {
  ok: boolean;
  message?: string;
  error?: string;
  durable?: boolean;
  path?: string;
};

type ProbeTarget =
  | "storage"
  | "ghl"
  | "calendar"
  | "stripe"
  | "gmail"
  | "youtube";

const PROBES: {
  id: ProbeTarget;
  label: string;
  hint: string;
}[] = [
  {
    id: "storage",
    label: "Admin storage (Blob)",
    hint: "Integrations + CMS must persist across redeploys",
  },
  {
    id: "ghl",
    label: "GoHighLevel CRM",
    hint: "Contacts, tags, programme cutover writes",
  },
  {
    id: "calendar",
    label: "Calendar booking",
    hint: "Pro / Elite call booking",
  },
  {
    id: "stripe",
    label: "Stripe payments",
    hint: "Checkout, Payment Links, webhooks",
  },
  {
    id: "gmail",
    label: "Gmail SMTP",
    hint: "DNA report email delivery",
  },
  {
    id: "youtube",
    label: "YouTube Data API",
    hint: "Optional — embeds work without this",
  },
];

function statusTone(status: IntegrationCheck["status"]) {
  if (status === "ready") return "text-[var(--accent)]";
  if (status === "missing") return "text-red-400";
  return "text-[var(--muted)]";
}

function probeTone(result: LiveResult | undefined, testing: boolean) {
  if (testing) return "text-[var(--muted)]";
  if (!result) return "text-[var(--muted)]";
  return result.ok ? "text-[var(--accent)]" : "text-red-400";
}

export function StatusAdmin() {
  const [loading, setLoading] = useState(true);
  const [testingAll, setTestingAll] = useState(false);
  const [testing, setTesting] = useState<ProbeTarget | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StatusPayload | null>(null);
  const [live, setLive] = useState<Partial<Record<ProbeTarget, LiveResult>>>(
    {},
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/integrations", { credentials: "include" });
      if (!res.ok) {
        setError("Could not load integration status.");
        return;
      }
      const json = (await res.json()) as StatusPayload;
      setData(json);
    } catch {
      setError("Could not load integration status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function runProbe(target: ProbeTarget) {
    setTesting(target);
    setError(null);
    try {
      const res = await fetch("/api/integrations/test", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const json = (await res.json()) as LiveResult & {
        message?: string;
        error?: string;
      };
      setLive((prev) => ({
        ...prev,
        [target]: {
          ok: Boolean(json.ok),
          message: json.message,
          error: json.error,
          durable: json.durable,
          path: json.path,
        },
      }));
    } catch {
      setLive((prev) => ({
        ...prev,
        [target]: { ok: false, error: "Request failed" },
      }));
    } finally {
      setTesting(null);
    }
  }

  async function runAllProbes() {
    setTestingAll(true);
    for (const probe of PROBES) {
      // Sequential so we do not hammer third-party APIs.
      // eslint-disable-next-line no-await-in-loop
      await runProbe(probe.id);
    }
    setTestingAll(false);
    await load();
  }

  const grouped = useMemo(() => {
    const checks = data?.checks ?? [];
    const map = new Map<string, IntegrationCheck[]>();
    for (const check of checks) {
      const list = map.get(check.group) ?? [];
      list.push(check);
      map.set(check.group, list);
    }
    return map;
  }, [data]);

  const requiredMissing = (data?.checks ?? []).filter(
    (c) => c.status === "missing",
  ).length;
  const liveOk = PROBES.filter((p) => live[p.id]?.ok).length;
  const liveFailed = PROBES.filter((p) => live[p.id] && !live[p.id]?.ok).length;

  return (
    <div className="space-y-8">
      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading status…</p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {data ? (
        <>
          <section
            className={[
              "rounded-lg border p-5",
              data.readyForLive
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--border)] bg-[var(--surface)]",
            ].join(" ")}
          >
            <p className="text-sm font-semibold text-[var(--fg)]">
              {data.readyForLive
                ? "Ready for live — required integrations are configured."
                : `Not ready — ${requiredMissing} required item(s) missing.`}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Storage: {data.storage.path}
              {data.storage.durable
                ? " · durable"
                : " · temporary until Blob token is live"}
              {liveOk || liveFailed
                ? ` · live probes ${liveOk} ok / ${liveFailed} failed`
                : ""}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={testingAll || testing !== null}
                onClick={() => void runAllProbes()}
                className="rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-bright)] disabled:opacity-60"
              >
                {testingAll ? "Testing all…" : "Run live connection tests"}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => void load()}
                className="rounded-md border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--fg)] transition hover:border-[var(--accent)]"
              >
                Refresh config
              </button>
              <Link
                href="/admin/integrations"
                className="inline-flex items-center rounded-md border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--fg-soft)] transition hover:border-[var(--accent)]"
              >
                Open Integrations
              </Link>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--fg)]">
              Live API probes
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Config can look set while the key is invalid. These hit the real
              APIs where possible.
            </p>
            <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--surface)]">
              {PROBES.map((probe) => {
                const result = live[probe.id];
                const busy = testing === probe.id;
                return (
                  <li
                    key={probe.id}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--fg)]">
                        {probe.label}
                      </p>
                      <p className="text-xs text-[var(--muted)]">{probe.hint}</p>
                      <p
                        className={`mt-1 text-sm font-medium ${probeTone(result, busy)}`}
                      >
                        {busy
                          ? "Testing…"
                          : result
                            ? result.ok
                              ? result.message || "Connected"
                              : result.error || "Failed"
                            : "Not tested yet"}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={testingAll || testing !== null}
                      onClick={() => void runProbe(probe.id)}
                      className="shrink-0 rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--fg)] transition hover:border-[var(--accent)] disabled:opacity-60"
                    >
                      Test
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[var(--fg)]">
              Configuration checklist
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Based on saved Integrations values (secrets never shown).
            </p>
            <ul className="space-y-4">
              {[...grouped.entries()].map(([group, checks]) => (
                <li key={group}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    {group}
                  </p>
                  <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                    {checks.map((check) => (
                      <li
                        key={check.id}
                        className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-start sm:justify-between sm:gap-3"
                      >
                        <span className="text-[var(--fg-soft)]">
                          {check.label}
                        </span>
                        <span
                          className={`font-medium sm:shrink-0 sm:text-right ${statusTone(check.status)}`}
                        >
                          {check.status}
                          {check.detail ? ` · ${check.detail}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  );
}

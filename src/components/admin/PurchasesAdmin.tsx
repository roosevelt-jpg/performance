"use client";

import { useCallback, useEffect, useState } from "react";
import {
  formatStripeMoney,
  type PurchaseRow,
  type PurchaseSummary,
} from "@/lib/stripe/purchases";

type Payload = {
  connected?: boolean;
  livemode?: boolean;
  rows?: PurchaseRow[];
  summary?: PurchaseSummary;
  error?: string;
};

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function PurchasesAdmin() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stripe/purchases", {
        credentials: "include",
      });
      const json = (await res.json()) as Payload;
      if (!res.ok) {
        setError(json.error ?? "Could not load purchases");
        return;
      }
      setData(json);
      if (json.error) setError(json.error);
    } catch {
      setError("Could not load purchases");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = data?.rows ?? [];
  const summary = data?.summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          Live from Stripe. Receipts open the hosted Stripe receipt — no dashboard
          login required.
        </p>
        <button
          type="button"
          className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold"
          onClick={() => void load()}
        >
          Refresh
        </button>
      </div>

      {data && !data.connected ? (
        <p className="rounded-md border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
          Add the Stripe secret key in{" "}
          <a href="/admin/integrations" className="text-[var(--accent)]">
            Admin → Integrations
          </a>
          , then save a price on each programme in Content → Tier cards.
        </p>
      ) : null}

      {summary && data?.connected ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Paid checkouts
            </p>
            <p className="mt-1 font-heading text-2xl">{summary.count}</p>
          </div>
          <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Gross (this page)
            </p>
            <p className="mt-1 font-heading text-2xl">
              {formatStripeMoney(summary.gross, summary.currency)}
            </p>
          </div>
          <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Mode
            </p>
            <p className="mt-1 font-heading text-2xl">
              {data.livemode ? "Live" : "Test"}
            </p>
          </div>
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading payments…</p>
      ) : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {!loading && data?.connected && rows.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No Stripe checkouts yet. After someone pays a Payment Link, they appear
          here with the receipt.
        </p>
      ) : null}

      {rows.length ? (
        <div className="overflow-x-auto border border-[var(--border)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--surface)] text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
              <tr>
                <th className="px-3 py-2 font-semibold">When</th>
                <th className="px-3 py-2 font-semibold">Customer</th>
                <th className="px-3 py-2 font-semibold">Programme</th>
                <th className="px-3 py-2 font-semibold">Amount</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="whitespace-nowrap px-3 py-2 text-[var(--fg-soft)]">
                    {formatWhen(row.createdAt)}
                  </td>
                  <td className="px-3 py-2">
                    <span className="block text-[var(--fg)]">
                      {row.customerName || "—"}
                    </span>
                    <span className="block text-xs text-[var(--muted)]">
                      {row.customerEmail || "No email"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-[var(--fg-soft)]">
                    {row.productName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    {formatStripeMoney(row.amount, row.currency)}
                  </td>
                  <td className="px-3 py-2 text-[var(--fg-soft)]">
                    {row.paymentStatus || row.status || "—"}
                  </td>
                  <td className="px-3 py-2">
                    {row.receiptUrl ? (
                      <a
                        href={row.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-[var(--accent)]"
                      >
                        View receipt
                      </a>
                    ) : (
                      <span className="text-[var(--muted)]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

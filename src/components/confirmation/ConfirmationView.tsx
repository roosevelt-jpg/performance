"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCms } from "@/components/cms/CmsProvider";
import { loadLeadFlow, mergeLeadFlow } from "@/lib/session/leadSession";

export function ConfirmationView() {
  const cms = useCms();
  const c = cms.confirmation;
  const router = useRouter();
  const [whatsapp, setWhatsapp] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [contactId, setContactId] = useState<string | null>(null);
  const [bookingLabel, setBookingLabel] = useState<string | null>(null);
  const [mobile, setMobile] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [bookingStart, setBookingStart] = useState<string | null>(null);
  const [bookingTimeZone, setBookingTimeZone] = useState<string | null>(null);

  useEffect(() => {
    const flow = loadLeadFlow();
    if (!flow?.answers || flow.evaluation?.outcome !== "qualified") {
      router.replace("/");
      return;
    }
    setContactId(flow.submissionId ?? null);
    setMobile(flow.answers.mobile || null);
    setName(flow.answers.name || null);
    if (flow.booking?.start) {
      const zone = flow.booking.timeZone || "Europe/London";
      setBookingStart(flow.booking.start);
      setBookingTimeZone(zone);
      setBookingLabel(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: zone,
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(flow.booking.start)),
      );
    }
    setReady(true);
  }, [router]);

  async function saveWhatsApp() {
    if (!contactId) {
      setSaved(true);
      return;
    }
    setSaving(true);
    try {
      await fetch("/api/whatsapp-optin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId,
          optedIn: whatsapp,
          mobile,
          name,
          bookingStart,
          bookingTimeZone,
        }),
      });
      mergeLeadFlow({ bookedAt: new Date().toISOString() });
      setSaved(true);
    } catch {
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (!ready) {
    return (
      <div className="px-4 py-16 text-center text-sm text-[var(--muted)]">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12 md:py-16 lg:px-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
        {c.eyebrow}
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--fg)] sm:text-3xl">
        {bookingLabel ? c.bookedTitle : c.title}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-[var(--fg-soft)]">
        {bookingLabel ? c.bookedBody : c.body}
      </p>
      {bookingLabel ? (
        <p className="mt-3 text-sm font-medium text-[var(--fg)]">
          {bookingLabel}
        </p>
      ) : null}

      <div className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-[var(--fg-soft)]">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
            checked={whatsapp}
            onChange={(e) => setWhatsapp(e.target.checked)}
            disabled={saved}
          />
          <span>{c.whatsappLabel}</span>
        </label>

        {!saved ? (
          <button
            type="button"
            onClick={saveWhatsApp}
            disabled={saving}
            className="mt-5 w-full rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-bright)] disabled:opacity-60 sm:w-auto sm:py-2.5"
          >
            {saving ? c.saving : c.save}
          </button>
        ) : (
          <p className="mt-5 text-sm text-[var(--accent)]">{c.saved}</p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarEmbed } from "@/components/calendar/CalendarEmbed";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import {
  loadLeadFlow,
  mergeLeadFlow,
  type LeadFlowState,
} from "@/lib/session/leadSession";

export default function CalendarPage() {
  const router = useRouter();
  const [flow, setFlow] = useState<LeadFlowState | null>(null);

  useEffect(() => {
    const current = loadLeadFlow();
    if (
      !current?.answers ||
      !current.evaluation ||
      current.evaluation.outcome !== "qualified"
    ) {
      router.replace("/");
      return;
    }
    setFlow(current);
  }, [router]);

  return (
    <main className="flex min-h-dvh flex-1 flex-col">
      <SiteHeader compact active="book" />
      <div className="flex-1">
        {flow?.answers ? (
          <CalendarEmbed
            tier={flow.tier}
            answers={flow.answers}
            contactId={flow.submissionId}
            onBooked={(booking) => {
              mergeLeadFlow({
                bookedAt: booking?.start ?? new Date().toISOString(),
                booking,
              });
              router.push("/book/confirmation");
            }}
          />
        ) : (
          <div className="px-4 py-16 text-center text-sm text-[var(--muted)]">
            Loading…
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}

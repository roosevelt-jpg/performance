"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionnaireForm } from "@/components/questionnaire/QuestionnaireForm";
import { FunnelChat } from "@/components/funnel/FunnelChat";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { useCms } from "@/components/cms/CmsProvider";
import type { BookableTier } from "@/lib/config/pricing";
import { loadLeadFlow, saveLeadFlow } from "@/lib/session/leadSession";

function parseTier(value: string | null): BookableTier | null {
  if (value === "pro" || value === "elite") return value;
  return null;
}

export default function BookPage() {
  const router = useRouter();
  const funnel = useCms().funnel;
  const [tier, setTier] = useState<BookableTier | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = parseTier(params.get("tier"));
    const fromSession = loadLeadFlow()?.tier ?? null;
    const resolved =
      fromQuery ?? fromSession ?? (funnel?.enabled ? funnel.defaultTier : null);

    if (!resolved) {
      router.replace("/");
      return;
    }

    saveLeadFlow({ tier: resolved });
    setTier(resolved);

    if (fromQuery && window.location.search) {
      window.history.replaceState({}, "", "/book");
    }
  }, [funnel?.defaultTier, funnel?.enabled, router]);

  return (
    <main className="flex min-h-dvh flex-1 flex-col">
      <SiteHeader compact active="book" />
      <div className="flex-1">
        {tier ? (
          funnel?.enabled ? (
            <FunnelChat variant="page" initialTier={tier} />
          ) : (
            <QuestionnaireForm tier={tier} />
          )
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

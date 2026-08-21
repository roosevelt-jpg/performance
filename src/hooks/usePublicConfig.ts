"use client";

import { useCallback, useEffect, useState } from "react";
import type { PublicRuntimeConfig } from "@/lib/integrations/runtime";

const EMPTY: PublicRuntimeConfig = {
  pricing: { pro: 449, elite: 599 },
  product: {
    showEntryTier: false,
    challengeCheckoutUrl:
      "https://theformulaperformance.com/products/the-formula-8-week-training-plan",
    challengeCheckoutEmbedUrl: "",
    challengeCheckoutOpenInNewTab: true,
  },
  calendar: {
    platform: "ghl",
    bookingMode: "auto",
    nativeBooking: false,
    nativeBookingPro: false,
    nativeBookingElite: false,
    timezone: "Europe/London",
    embedPro: "",
    embedElite: "",
  },
  emailSignup: {
    enabled: false,
    provider: "ghl",
  },
  stripe: { enabled: false, publishableKey: "" },
};

export function usePublicConfig() {
  const [config, setConfig] = useState<PublicRuntimeConfig>(EMPTY);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/public-config", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as PublicRuntimeConfig;
      setConfig({
        ...EMPTY,
        ...data,
        product: { ...EMPTY.product, ...data.product },
        pricing: { ...EMPTY.pricing, ...data.pricing },
        calendar: { ...EMPTY.calendar, ...data.calendar },
        emailSignup: { ...EMPTY.emailSignup, ...data.emailSignup },
        stripe: { ...EMPTY.stripe, ...data.stripe },
      });
    } catch {
      /* keep last / defaults */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    const id = window.setInterval(() => void refresh(), 15_000);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(id);
    };
  }, [refresh]);

  return { config, loading, refresh };
}

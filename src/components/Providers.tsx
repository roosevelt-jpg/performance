"use client";

import { CmsProvider } from "@/components/cms/CmsProvider";
import { SiteWidgets } from "@/components/marketing/SiteWidgets";
import { WatchGateProvider } from "@/components/marketing/WatchGate";
import type { CmsContent } from "@/lib/cms/types";
import { type ReactNode } from "react";

export function Providers({
  initial,
  children,
}: {
  initial?: CmsContent;
  children: ReactNode;
}) {
  return (
    <CmsProvider initial={initial}>
      <WatchGateProvider>
        {children}
        <SiteWidgets />
      </WatchGateProvider>
    </CmsProvider>
  );
}

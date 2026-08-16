"use client";

import { ApplyFlow } from "@/components/apply/ApplyFlow";
import { useCms } from "@/components/cms/CmsProvider";
import Link from "next/link";

export default function ApplyRoutePage() {
  const enabled = useCms().applyFunnel.enabled;
  if (!enabled) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-4">
        <p className="text-sm text-[var(--muted)]">
          The gated apply funnel is off.{" "}
          <Link href="/" className="text-[var(--accent)]">
            Back to the site
          </Link>
        </p>
      </main>
    );
  }
  return <ApplyFlow />;
}

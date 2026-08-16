"use client";

import { DnaFlow } from "@/components/dna/DnaFlow";
import { useCms } from "@/components/cms/CmsProvider";
import Link from "next/link";

export default function DnaRoutePage() {
  const enabled = useCms().dna.enabled;
  if (!enabled) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-4">
        <p className="text-sm text-[var(--muted)]">
          Performance DNA is off.{" "}
          <Link href="/" className="text-[var(--accent)]">
            Back to the site
          </Link>
        </p>
      </main>
    );
  }
  return <DnaFlow />;
}

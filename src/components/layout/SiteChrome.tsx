"use client";

import Link from "next/link";
import { useCms } from "@/components/cms/CmsProvider";

type Props = {
  active?: "home" | "tiers" | "book" | "admin";
  compact?: boolean;
};

export function SiteHeader({ active }: Props) {
  const cms = useCms();
  const brand = cms.site.brand;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-soft)] bg-[var(--bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg)]/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href={cms.chrome.headerLogoHref || "/"}
          className="font-heading min-w-0 truncate text-sm tracking-tight text-[var(--fg)] sm:text-base"
        >
          {brand.wordmark}{" "}
          <span className="text-[var(--accent)]">{brand.accent}</span>
        </Link>
        <nav className="flex shrink-0 items-center gap-4 text-sm sm:gap-5">
          {cms.chrome.nav
            .filter((l) => l.visible)
            .map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={[
                  "transition hover:text-[var(--accent)]",
                  (active === "tiers" || active === "book") &&
                  link.href.includes("#tiers")
                    ? "text-[var(--accent)]"
                    : active === "admin" && link.href.includes("admin")
                      ? "text-[var(--accent)]"
                      : "text-[var(--muted)]",
                ].join(" ")}
              >
                {link.label}
              </Link>
            ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const cms = useCms();

  return (
    <footer className="mt-auto border-t border-[var(--border-soft)] py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>{cms.chrome.footerCopyright}</span>
        <div className="flex flex-wrap gap-4">
          {cms.chrome.footerLinks
            .filter((l) => l.visible)
            .map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="hover:text-[var(--accent)]"
              >
                {link.label}
              </Link>
            ))}
        </div>
      </div>
      {cms.home.disclaimer?.enabled && cms.home.disclaimer.text ? (
        <p className="mx-auto mt-4 max-w-6xl px-4 text-xs leading-[1.7] text-[var(--muted)] sm:px-6">
          {cms.home.disclaimer.text}
        </p>
      ) : null}
    </footer>
  );
}

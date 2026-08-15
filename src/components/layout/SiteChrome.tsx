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
  const links = cms.chrome.nav.filter((l) => l.visible);

  return (
    <header className="border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="relative mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 sm:px-6 sm:py-3.5">
        <div />
        <Link
          href={cms.chrome.headerLogoHref || "/"}
          className="justify-self-center"
        >
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="h-7 w-auto max-w-[220px] object-contain sm:h-8"
            />
          ) : (
            <span className="font-heading text-base tracking-tight text-[var(--fg)]">
              {brand.wordmark}{" "}
              <span className="text-[var(--accent)]">{brand.accent}</span>
            </span>
          )}
        </Link>
        <nav className="flex shrink-0 items-center justify-end gap-4 text-sm">
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={[
                "transition hover:text-[var(--accent)]",
                (active === "tiers" || active === "book") &&
                link.href.includes("#tiers")
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
    <footer className="mt-auto border-t border-[var(--border)] py-6">
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

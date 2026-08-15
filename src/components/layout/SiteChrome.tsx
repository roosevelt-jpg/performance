"use client";

import Link from "next/link";
import { useCms } from "@/components/cms/CmsProvider";
import { GatedLink } from "@/components/marketing/WatchGate";
import { isFunnelApplyHref } from "@/lib/funnel/open";

export const FALLBACK_LOGO = "/logo.png";

type Props = {
  active?: "home" | "tiers" | "book" | "admin";
  compact?: boolean;
};

export function BrandLogo({
  className = "h-9 w-auto max-w-[220px] object-contain sm:h-10",
}: {
  className?: string;
}) {
  const cms = useCms();
  const src = cms.site.brand.logoUrl?.trim() || FALLBACK_LOGO;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={cms.site.brand.name} className={className} />
  );
}

export function SiteHeader({ active }: Props) {
  const cms = useCms();
  const links = cms.chrome.nav.filter((l) => l.visible);

  return (
    <header className="border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="relative mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-2.5 sm:px-6 sm:py-3">
        <div />
        <Link
          href={cms.chrome.headerLogoHref || "/"}
          className="justify-self-center"
        >
          <BrandLogo />
        </Link>
        <nav className="flex shrink-0 items-center justify-end gap-4 text-sm">
          {links.map((link) => {
            const className = [
              "transition hover:text-[var(--accent)]",
              (active === "tiers" || active === "book") &&
              (link.href.includes("#tiers") || link.href.includes("/book"))
                ? "text-[var(--accent)]"
                : "text-[var(--muted)]",
            ].join(" ");
            if (isFunnelApplyHref(link.href)) {
              return (
                <GatedLink key={link.id} href={link.href} className={className}>
                  {link.label}
                </GatedLink>
              );
            }
            return (
              <Link key={link.id} href={link.href} className={className}>
                {link.label}
              </Link>
            );
          })}
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
            .map((link) =>
              isFunnelApplyHref(link.href) ? (
                <GatedLink
                  key={link.id}
                  href={link.href}
                  className="hover:text-[var(--accent)]"
                >
                  {link.label}
                </GatedLink>
              ) : (
                <Link
                  key={link.id}
                  href={link.href}
                  className="hover:text-[var(--accent)]"
                >
                  {link.label}
                </Link>
              ),
            )}
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

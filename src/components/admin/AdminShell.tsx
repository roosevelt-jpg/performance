"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";

const TABS = [
  { href: "/admin/content", label: "Content CMS" },
  { href: "/admin/funnel", label: "Funnel" },
  { href: "/admin/purchases", label: "Purchases" },
  { href: "/admin/integrations", label: "Integrations" },
] as const;

export function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/me", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        const data = (await res.json()) as { username?: string };
        if (!cancelled) {
          setUsername(data.username ?? "admin");
          setChecking(false);
        }
      })
      .catch(() => {
        router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "include",
    });
    router.replace("/admin/login");
  }

  return (
    <main className="flex min-h-dvh flex-1 flex-col">
      <SiteHeader active="admin" onLogout={() => void logout()} />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-10 lg:px-6">
        <header className="mb-6 border-b border-[var(--border)] pb-5 sm:mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                Admin
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--fg)] sm:text-3xl">
                {title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
                {subtitle}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {username ? (
                <span className="text-[var(--muted)]">
                  Signed in as {username}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => void logout()}
                className="inline-flex items-center justify-center rounded-md border border-[var(--border-soft)] px-3 py-2 text-sm font-semibold text-[var(--fg)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                Log out
              </button>
              <Link
                href="/"
                className="text-[var(--muted)] hover:text-[var(--accent)]"
              >
                View site
              </Link>
            </div>
          </div>

          <nav className="mt-5 flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const active = pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={[
                    "rounded-md px-3 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                      : "border border-[var(--border)] text-[var(--fg-soft)] hover:border-[var(--accent)]",
                  ].join(" ")}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </header>

        {checking ? (
          <p className="text-sm text-[var(--muted)]">Checking session…</p>
        ) : (
          children
        )}
      </div>
      <SiteFooter />
    </main>
  );
}

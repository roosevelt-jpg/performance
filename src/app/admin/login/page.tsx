"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin/content";
  const idle = params.get("reason") === "idle";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [credentialsConfigured, setCredentialsConfigured] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/me", { credentials: "include" })
      .then(async (res) => {
        const data = (await res.json()) as {
          authenticated?: boolean;
          credentialsConfigured?: boolean;
        };
        if (cancelled) return;
        if (data.authenticated) {
          router.replace(next);
          return;
        }
        setCredentialsConfigured(data.credentialsConfigured !== false);
      })
      .catch(() => {
        if (!cancelled) setCredentialsConfigured(null);
      });
    return () => {
      cancelled = true;
    };
  }, [next, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        setSubmitting(false);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError("Login failed");
      setSubmitting(false);
    }
  }

  const fieldClass =
    "mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-base text-[var(--fg)] outline-none focus:border-[var(--accent)] sm:text-sm";

  const loginDisabled = credentialsConfigured === false;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:py-16">
      <div className="mb-6 text-center sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
          The Formula Performance
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--fg)] sm:text-3xl">
          Admin login
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Sign in to manage integrations and go-live settings. You are signed
          out after 10 minutes of inactivity.
        </p>
      </div>

      {loginDisabled ? (
        <div
          className="mb-4 space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-[var(--fg-soft)]"
          role="alert"
        >
          <p className="font-semibold text-[var(--fg)]">
            Admin login is not configured on this server yet.
          </p>
          <p>
            Add{" "}
            <code className="text-xs">ADMIN_USERNAME</code> and{" "}
            <code className="text-xs">ADMIN_PASSWORD</code> in your host’s{" "}
            <strong>environment variables</strong>, then redeploy production.
          </p>
          <p className="text-xs text-[var(--muted)]">
            Also set <code>NEXT_PUBLIC_SITE_URL=https://train.theformulaperformance.com</code>{" "}
            and a random <code>ADMIN_SESSION_SECRET</code>.
          </p>
        </div>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6"
      >
        <label className="block text-sm font-medium text-[var(--fg)]">
          Username
          <input
            className={fieldClass}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-medium text-[var(--fg)]">
          Password
          <input
            type="password"
            className={fieldClass}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {idle ? (
          <p className="text-sm text-[var(--fg-soft)]" role="status">
            You were signed out after 10 minutes without activity.
          </p>
        ) : null}

        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting || loginDisabled}
          className="w-full rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-bright)] disabled:opacity-60 sm:py-2.5"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--accent)]">
          ← Back to site
        </Link>
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh flex-1 flex-col">
      <SiteHeader active="admin" />
      <Suspense
        fallback={
          <div className="px-4 py-16 text-center text-sm text-[var(--muted)]">
            Loading…
          </div>
        }
      >
        <LoginForm />
      </Suspense>
      <SiteFooter />
    </main>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteFooter, SiteHeader, BrandLogo } from "@/components/layout/SiteChrome";
import { useCms } from "@/components/cms/CmsProvider";
import { MediaAt } from "@/components/marketing/MediaSections";
import { BenchmarkSection } from "@/components/marketing/BenchmarkSection";
import { CredentialsSection } from "@/components/marketing/CredentialsSection";
import { Testimonials } from "@/components/marketing/Testimonials";
import { VslSection } from "@/components/marketing/VslSection";
import { WhatsappCoachSection } from "@/components/marketing/WhatsappCoachSection";
import { GatedLink } from "@/components/marketing/WatchGate";
import { TierRow } from "@/components/tiers/TierRow";
import {
  extractYoutubeId,
  youtubeEmbedSrc,
} from "@/lib/media/youtube";

function HeroPoster({ src }: { src?: string }) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

function HeroMedia() {
  const cms = useCms();
  const hero = cms.home.hero;
  if (hero.mediaType === "none" || !hero.mediaUrl) return null;

  const youtubeId =
    hero.mediaType === "youtube" || hero.mediaType === "video"
      ? extractYoutubeId(hero.mediaUrl)
      : null;

  if (youtubeId) {
    return (
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <HeroPoster src={hero.mediaPoster} />
        <iframe
          className="absolute left-1/2 top-1/2 aspect-video h-[180%] w-[180%] max-w-none -translate-x-1/2 -translate-y-1/2"
          src={`${youtubeEmbedSrc(youtubeId, true)}&mute=1&controls=0&loop=1&playlist=${youtubeId}`}
          title={hero.mediaAlt || "Hero video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }

  if (hero.mediaType === "video") {
    return (
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        src={hero.mediaUrl}
        poster={hero.mediaPoster || undefined}
        autoPlay
        muted
        loop
        playsInline
        aria-label={hero.mediaAlt || undefined}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={hero.mediaUrl}
      alt={hero.mediaAlt || ""}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
    />
  );
}

function ProofStrip() {
  const { proof } = useCms().home;
  if (!proof.enabled || !proof.items.length) return null;

  return (
    <section
      aria-label="Proof points"
      className="border-b border-[var(--border)] bg-[var(--surface)]"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-[var(--border)] sm:grid-cols-4">
        {proof.items.map((item, i) => (
          <div
            key={item.id}
            className="bg-[var(--surface)] px-4 py-6 sm:px-6 sm:py-8"
            style={{ animationDelay: `${120 + i * 80}ms` }}
          >
            <p className="animate-rise font-heading text-2xl text-[var(--accent)] sm:text-3xl">
              {item.value}
            </p>
            <p className="animate-rise mt-1 text-sm text-[var(--muted)]">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProblemSection() {
  const { problem } = useCms().home;
  if (!problem.enabled) return null;

  return (
    <section className="border-b border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-4 section-y sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
          {problem.eyebrow}
        </p>
        <h2 className="mt-3 max-w-3xl font-heading text-[clamp(1.7rem,4.2vw,2.5rem)] text-[var(--fg)]">
          {problem.title}
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-[1.7] text-[var(--muted)] sm:text-lg">
          {problem.body}
        </p>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { howItWorks } = useCms().home;
  if (!howItWorks.enabled) return null;

  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-4 section-y sm:px-6">
        <h2 className="font-heading text-[clamp(1.7rem,4.2vw,2.5rem)] text-[var(--fg)]">
          {howItWorks.heading}
        </h2>
        <p className="mt-3 max-w-xl text-base leading-[1.7] text-[var(--muted)]">
          {howItWorks.subhead}
        </p>
        <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {howItWorks.steps.map((step, i) => (
            <li key={step.id} className="min-w-0">
              <p className="font-heading text-4xl text-[var(--accent)]">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-heading text-xl text-[var(--fg)] sm:text-2xl">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-[1.7] text-[var(--muted)] sm:text-base">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function FaqSection() {
  const { faq } = useCms().home;
  const [openId, setOpenId] = useState<string | null>(faq.items[0]?.id ?? null);
  if (!faq.enabled || !faq.items.length) return null;

  return (
    <section className="border-b border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-4 section-y sm:px-6">
        <h2 className="font-heading text-[clamp(1.7rem,4.2vw,2.5rem)] text-[var(--fg)]">
          {faq.heading}
        </h2>
        <ul className="mt-8 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {faq.items.map((item) => {
            const open = openId === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-4 py-5 text-left"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : item.id)}
                >
                  <span className="text-base font-semibold text-[var(--fg)] sm:text-lg">
                    {item.question}
                  </span>
                  <span
                    className="mt-1 shrink-0 text-[var(--accent)] transition-transform duration-300"
                    style={{ transform: open ? "rotate(45deg)" : "none" }}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 pr-8 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function FinalCta() {
  const cms = useCms();
  const { finalCta } = cms.home;
  if (!finalCta.enabled) return null;

  return (
    <section className="relative overflow-hidden border-b border-[var(--border)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_120%,_var(--accent-glow),_transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-4 section-y text-center sm:px-6">
        <h2 className="mx-auto max-w-3xl font-heading text-[clamp(1.7rem,4.2vw,2.5rem)] text-[var(--fg)]">
          {finalCta.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-[1.7] text-[var(--muted)]">
          {finalCta.body}
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <GatedLink
            href={finalCta.primary.href}
            className="inline-flex items-center justify-center rounded-md bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-bright)]"
          >
            {finalCta.primary.label}
          </GatedLink>
          <Link
            href={finalCta.secondary.href}
            className="inline-flex items-center justify-center rounded-md border border-[var(--border)] px-6 py-3.5 text-sm font-semibold text-[var(--fg)] transition hover:border-[var(--fg-soft)]"
          >
            {finalCta.secondary.label}
          </Link>
        </div>
        <div className="mt-16 flex justify-center sm:mt-20">
          <BrandLogo className="h-12 w-auto max-w-[260px] object-contain sm:h-14" />
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const cms = useCms();
  const hero = cms.home.hero;
  const hasHeroMedia = hero.mediaType !== "none" && Boolean(hero.mediaUrl);

  return (
    <main className="flex min-h-dvh flex-1 flex-col">
      <SiteHeader active="home" />

      <section
        id="hero"
        className="relative overflow-hidden border-b border-[var(--border)]"
      >
        {hasHeroMedia ? (
          <>
            <HeroMedia />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/70 to-[var(--bg)]/40" />
          </>
        ) : (
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,_var(--accent-glow),_transparent_55%),linear-gradient(180deg,#1a0605_0%,#0a0a0a_42%,#0a0a0a_100%)]" />
            <div className="hero-grain absolute inset-0 opacity-[0.28]" />
          </div>
        )}

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-8 pt-6 sm:px-6 sm:pb-10 sm:pt-8">
          {hero.eyebrow ? (
            <p className="animate-rise text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
              {hero.eyebrow}
            </p>
          ) : null}
          <h1
            className="animate-rise mt-3 max-w-3xl font-heading text-[clamp(1.85rem,5.2vw,3.05rem)] leading-[1.12] text-[var(--fg)]"
            style={{ animationDelay: "80ms" }}
          >
            {hero.headline}
          </h1>
          <p
            className="animate-rise mt-4 max-w-xl text-[0.95rem] leading-[1.7] text-[var(--muted)] sm:text-lg"
            style={{ animationDelay: "140ms" }}
          >
            {hero.body}
          </p>
          <div
            className="animate-rise mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "200ms" }}
          >
            <Link
              href={hero.cta.href}
              className="inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-bright)] sm:w-auto"
            >
              {hero.cta.label}
            </Link>
            {hero.secondaryCta?.label ? (
              <Link
                href={hero.secondaryCta.href}
                className="inline-flex w-full items-center justify-center rounded-md border border-[var(--border-soft)] px-6 py-3.5 text-sm font-semibold text-[var(--fg)] transition hover:border-[var(--fg-soft)] sm:w-auto"
              >
                {hero.secondaryCta.label}
              </Link>
            ) : null}
          </div>
          {hero.ctaNote ? (
            <p
              className="animate-rise mt-3 text-sm text-[var(--muted)]"
              style={{ animationDelay: "260ms" }}
            >
              {hero.ctaNote}
            </p>
          ) : null}
          {hero.portraitUrl ? (
            <div className="animate-rise mt-8" style={{ animationDelay: "300ms" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hero.portraitUrl}
                alt={hero.portraitAlt || ""}
                className="mx-auto max-h-[420px] w-full max-w-md object-contain object-bottom sm:max-h-[520px]"
              />
            </div>
          ) : null}
        </div>
      </section>

      <MediaAt slot="after-hero" />
      <VslSection />
      <MediaAt slot="after-vsl" />
      <ProofStrip />
      <MediaAt slot="after-proof" />
      <Testimonials />
      <MediaAt slot="after-testimonials" />
      <CredentialsSection />
      <ProblemSection />
      <MediaAt slot="after-problem" />
      <WhatsappCoachSection />
      <BenchmarkSection />
      <HowItWorks />
      <MediaAt slot="after-how" />
      <MediaAt slot="before-tiers" />
      <TierRow />
      <MediaAt slot="after-tiers" />
      <MediaAt slot="before-faq" />
      <FaqSection />
      <MediaAt slot="after-faq" />
      <MediaAt slot="before-final" />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}

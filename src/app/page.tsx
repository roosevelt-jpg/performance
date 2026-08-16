"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteFooter, SiteHeader, BrandLogo } from "@/components/layout/SiteChrome";
import { useCms } from "@/components/cms/CmsProvider";
import { MediaAt } from "@/components/marketing/MediaSections";
import { BenchmarkSection } from "@/components/marketing/BenchmarkSection";
import { CredentialsSection } from "@/components/marketing/CredentialsSection";
import { PhoneMockup } from "@/components/marketing/PhoneMockup";
import { Testimonials } from "@/components/marketing/Testimonials";
import { ProofStats } from "@/components/marketing/ProofStats";
import { VslSection } from "@/components/marketing/VslSection";
import { WhatsappCoachSection } from "@/components/marketing/WhatsappCoachSection";
import { DnaTeaser } from "@/components/dna/DnaTeaser";
import { GatedLink } from "@/components/marketing/WatchGate";
import { TierRow } from "@/components/tiers/TierRow";
import { HERO_CHAT } from "@/content/hero-chat";
import { isFunnelSectionOn } from "@/lib/funnel/layout";
import { isFunnelApplyHref } from "@/lib/funnel/open";
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
        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          {howItWorks.steps
            .filter((step) => step.title.trim() || step.body.trim())
            .map((step, i) => (
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
  const items = faq.items.filter(
    (item) => item.question.trim() && item.answer.trim(),
  );
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  if (!faq.enabled || !items.length) return null;

  return (
    <section className="border-b border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-4 section-y sm:px-6">
        <h2 className="font-heading text-[clamp(1.7rem,4.2vw,2.5rem)] text-[var(--fg)]">
          {faq.heading}
        </h2>
        <ul className="mt-8 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {items.map((item) => {
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
  const showPhone = isFunnelSectionOn(cms, "phoneMockup");

  return (
    <main className="flex min-h-dvh flex-1 flex-col">
      <SiteHeader active="home" />

      <section
        id="hero"
        className="hero-stage relative isolate overflow-hidden border-b border-[var(--border)]"
      >
        {hero.portraitUrl ? (
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.portraitUrl}
              alt=""
              className="h-full w-full max-w-none object-cover object-[50%_10%] sm:object-[52%_12%] lg:object-[62%_16%] xl:object-[58%_14%]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.22)_0%,rgba(10,10,10,0.08)_28%,rgba(10,10,10,0.5)_58%,rgba(10,10,10,0.92)_100%)] lg:hidden" />
            <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(10,10,10,0.9)_0%,rgba(10,10,10,0.46)_46%,rgba(10,10,10,0.16)_100%),linear-gradient(180deg,rgba(10,10,10,0.28)_0%,transparent_30%,rgba(10,10,10,0.5)_100%)] lg:block" />
          </div>
        ) : hasHeroMedia ? (
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

        <div
          className={[
            "hero-copy-wrap relative mx-auto flex w-full max-w-6xl flex-col justify-end gap-8 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 sm:px-6",
            "lg:justify-start lg:pb-12 lg:pt-8",
            showPhone
              ? "min-[940px]:grid min-[940px]:grid-cols-[1.06fr_0.94fr] min-[940px]:items-center min-[940px]:justify-stretch min-[940px]:gap-12"
              : "",
          ].join(" ")}
        >
          <div className="w-full max-w-xl xl:max-w-2xl">
            {hero.eyebrow ? (
              <p className="animate-rise text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                {hero.eyebrow}
              </p>
            ) : null}
            <h1
              className="animate-rise mt-3 max-w-3xl font-heading text-[clamp(1.65rem,2.4vw+1.15rem,3.05rem)] leading-[1.12] text-[var(--fg)]"
              style={{ animationDelay: "80ms" }}
            >
              {hero.headline}
            </h1>
            <div className="mt-3 sm:mt-4 lg:mt-[clamp(2.75rem,9svh,6.75rem)]">
              <p
                className="animate-rise max-w-xl text-[0.9rem] leading-[1.65] text-[var(--muted)] sm:text-base sm:leading-[1.7] lg:text-lg"
                style={{ animationDelay: "140ms" }}
              >
                {hero.body}
              </p>
              <div
                className="animate-rise mt-5 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center sm:mt-6"
                style={{ animationDelay: "200ms" }}
              >
                {isFunnelApplyHref(hero.cta.href) ? (
                  <GatedLink
                    href={hero.cta.href}
                    className="inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-bright)] min-[420px]:w-auto sm:px-6 sm:py-3.5"
                  >
                    {hero.cta.label}
                  </GatedLink>
                ) : (
                  <Link
                    href={hero.cta.href}
                    className="inline-flex w-full items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-bright)] min-[420px]:w-auto sm:px-6 sm:py-3.5"
                  >
                    {hero.cta.label}
                  </Link>
                )}
                {hero.secondaryCta?.label ? (
                  isFunnelApplyHref(hero.secondaryCta.href) ? (
                    <GatedLink
                      href={hero.secondaryCta.href}
                      className="inline-flex w-full items-center justify-center rounded-md border border-[var(--border-soft)] px-5 py-3 text-sm font-semibold text-[var(--fg)] transition hover:border-[var(--fg-soft)] min-[420px]:w-auto sm:px-6 sm:py-3.5"
                    >
                      {hero.secondaryCta.label}
                    </GatedLink>
                  ) : (
                    <Link
                      href={hero.secondaryCta.href}
                      className="inline-flex w-full items-center justify-center rounded-md border border-[var(--border-soft)] px-5 py-3 text-sm font-semibold text-[var(--fg)] transition hover:border-[var(--fg-soft)] min-[420px]:w-auto sm:px-6 sm:py-3.5"
                    >
                      {hero.secondaryCta.label}
                    </Link>
                  )
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
            </div>
          </div>
          {showPhone && hero.portraitUrl ? (
            <div className="animate-rise" style={{ animationDelay: "160ms" }}>
              <PhoneMockup
                imageSrc={hero.portraitUrl}
                imageAlt={hero.portraitAlt || ""}
                chat={HERO_CHAT}
                chatName="Kane · Your Coach"
                avatarUrl="/assets/kane-headshot.png"
              />
            </div>
          ) : null}
        </div>
      </section>

      <MediaAt slot="after-hero" />
      {isFunnelSectionOn(cms, "vsl") ? <VslSection /> : null}
      <MediaAt slot="after-vsl" />
      {isFunnelSectionOn(cms, "proof") ? <ProofStats /> : null}
      <MediaAt slot="after-proof" />
      {isFunnelSectionOn(cms, "testimonials") ? <Testimonials /> : null}
      <MediaAt slot="after-testimonials" />
      {isFunnelSectionOn(cms, "credentials") ? <CredentialsSection /> : null}
      {isFunnelSectionOn(cms, "problem") ? <ProblemSection /> : null}
      <DnaTeaser />
      <MediaAt slot="after-problem" />
      {isFunnelSectionOn(cms, "whatsappCoach") ? <WhatsappCoachSection /> : null}
      {isFunnelSectionOn(cms, "benchmarks") ? <BenchmarkSection /> : null}
      {isFunnelSectionOn(cms, "howItWorks") ? <HowItWorks /> : null}
      <MediaAt slot="after-how" />
      <MediaAt slot="before-tiers" />
      {isFunnelSectionOn(cms, "tiers") ? <TierRow /> : null}
      <MediaAt slot="after-tiers" />
      <MediaAt slot="before-faq" />
      {isFunnelSectionOn(cms, "faq") ? <FaqSection /> : null}
      <MediaAt slot="after-faq" />
      <MediaAt slot="before-final" />
      {isFunnelSectionOn(cms, "finalCta") ? <FinalCta /> : null}
      <SiteFooter />
    </main>
  );
}

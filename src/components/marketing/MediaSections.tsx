"use client";

import Link from "next/link";
import { useCms } from "@/components/cms/CmsProvider";
import { YoutubeEmbed } from "@/components/marketing/YoutubeEmbed";
import type { CmsMediaSlot } from "@/lib/cms/types";
import { extractYoutubeId } from "@/lib/media/youtube";

export function ImageSectionsAt({ slot }: { slot: CmsMediaSlot }) {
  const sections = (useCms().home.imageSections ?? []).filter(
    (s) => s.enabled && s.slot === slot,
  );
  if (!sections.length) return null;

  return (
    <>
      {sections.map((section) => {
        const images = section.images.filter((img) => img.enabled && img.url);
        if (!images.length) return null;

        return (
          <section
            key={section.id}
            className="border-b border-[var(--border)]"
            aria-labelledby={section.heading ? `${section.id}-heading` : undefined}
          >
            {(section.heading || section.subhead) && (
              <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 sm:pt-16">
                {section.heading ? (
                  <h2
                    id={`${section.id}-heading`}
                    className="font-heading text-[clamp(1.75rem,4vw,2.8rem)] uppercase text-[var(--fg)]"
                  >
                    {section.heading}
                  </h2>
                ) : null}
                {section.subhead ? (
                  <p className="mt-3 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
                    {section.subhead}
                  </p>
                ) : null}
              </div>
            )}

            {section.layout === "full" ? (
              <div className="mt-8 space-y-6 pb-14 sm:mt-10 sm:pb-16">
                {images.map((img) => (
                  <figure key={img.id} className="relative w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt || ""}
                      className="max-h-[70vh] w-full object-cover"
                    />
                    {(img.caption || img.cta.label) && (
                      <figcaption className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        {img.caption ? (
                          <p className="text-sm text-[var(--muted)]">{img.caption}</p>
                        ) : (
                          <span />
                        )}
                        {img.cta.label ? (
                          <Link
                            href={img.cta.href || "#"}
                            className="inline-flex items-center justify-center rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-fg)]"
                          >
                            {img.cta.label}
                          </Link>
                        ) : null}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            ) : null}

            {section.layout === "split" ? (
              <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 sm:py-14">
                {images.map((img) => (
                  <figure key={img.id} className="min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt || ""}
                      className="aspect-[4/5] w-full object-cover sm:aspect-[3/4]"
                    />
                    {img.caption ? (
                      <figcaption className="mt-3 text-sm text-[var(--muted)]">
                        {img.caption}
                      </figcaption>
                    ) : null}
                    {img.cta.label ? (
                      <Link
                        href={img.cta.href || "#"}
                        className="mt-3 inline-flex text-sm font-semibold text-[var(--accent)]"
                      >
                        {img.cta.label}
                      </Link>
                    ) : null}
                  </figure>
                ))}
              </div>
            ) : null}

            {section.layout === "grid" ? (
              <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-10 sm:grid-cols-2 sm:gap-5 sm:px-6 sm:py-14 lg:grid-cols-3">
                {images.map((img) => (
                  <figure key={img.id} className="min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt || ""}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    {img.caption ? (
                      <figcaption className="mt-2 text-sm text-[var(--muted)]">
                        {img.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            ) : null}
          </section>
        );
      })}
    </>
  );
}

export function VideoSectionsAt({ slot }: { slot: CmsMediaSlot }) {
  const sections = (useCms().home.videoSections ?? []).filter(
    (s) => s.enabled && s.slot === slot,
  );
  if (!sections.length) return null;

  return (
    <>
      {sections.map((section) => {
        const videos = section.videos.filter(
          (v) => v.enabled && extractYoutubeId(v.youtubeUrl),
        );
        if (!videos.length) return null;

        return (
          <section
            key={section.id}
            className="border-b border-[var(--border)] bg-[var(--surface)]"
            aria-labelledby={
              section.heading ? `${section.id}-heading` : undefined
            }
          >
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
              {section.heading ? (
                <h2
                  id={`${section.id}-heading`}
                  className="font-heading text-[clamp(1.75rem,4vw,2.8rem)] uppercase text-[var(--fg)]"
                >
                  {section.heading}
                </h2>
              ) : null}
              {section.subhead ? (
                <p className="mt-3 max-w-2xl text-sm text-[var(--muted)] sm:text-base">
                  {section.subhead}
                </p>
              ) : null}

              <div
                className={
                  videos.length === 1
                    ? "mt-8"
                    : "mt-8 grid gap-8 md:grid-cols-2"
                }
              >
                {videos.map((video) => (
                  <article key={video.id} className="min-w-0">
                    <YoutubeEmbed
                      youtubeUrl={video.youtubeUrl}
                      title={video.title}
                      thumbnailUrl={video.thumbnailUrl}
                    />
                    {video.body ? (
                      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                        {video.body}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}

export function MediaAt({ slot }: { slot: CmsMediaSlot }) {
  return (
    <>
      <ImageSectionsAt slot={slot} />
      <VideoSectionsAt slot={slot} />
    </>
  );
}

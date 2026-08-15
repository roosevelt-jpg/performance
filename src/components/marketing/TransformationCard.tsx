"use client";

import { useCallback, useId, useRef, useState } from "react";

type Props = {
  name: string;
  quote: string;
  result?: string;
  imageUrl: string;
  beforeImageUrl: string;
  imageAlt: string;
};

function CompareSlider({
  beforeSrc,
  afterSrc,
  alt,
  name,
}: {
  beforeSrc: string;
  afterSrc: string;
  alt: string;
  name: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(52);
  const [active, setActive] = useState(false);
  const labelId = useId();

  const moveTo = useCallback((clientX: number) => {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    if (rect.width <= 0) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setSplit(Math.min(92, Math.max(8, next)));
  }, []);

  return (
    <div
      ref={frameRef}
      className="relative aspect-[6/5] w-full cursor-ew-resize overflow-hidden rounded-[2px] select-none touch-none"
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => {
        setActive(false);
        setSplit(52);
      }}
      onPointerMove={(e) => {
        if (e.pointerType === "mouse" || e.buttons > 0) moveTo(e.clientX);
      }}
      onPointerDown={(e) => {
        setActive(true);
        frameRef.current?.setPointerCapture(e.pointerId);
        moveTo(e.clientX);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={afterSrc}
        alt={alt || `${name} after`}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={beforeSrc}
        alt={`${name} before`}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
        style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 z-[1] w-px bg-white/80"
        style={{ left: `${split}%` }}
      >
        <span
          className={[
            "absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-black/55 text-white shadow-lg backdrop-blur-sm transition-transform",
            active ? "scale-110" : "scale-100",
          ].join(" ")}
          aria-hidden
        >
          <span className="text-xs tracking-tight">↔</span>
        </span>
      </div>
      <span
        className={[
          "pointer-events-none absolute top-2 left-2 z-[2] rounded-sm bg-black/65 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition-opacity",
          split > 18 ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        Before
      </span>
      <span
        className={[
          "pointer-events-none absolute top-2 right-2 z-[2] rounded-sm bg-black/65 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition-opacity",
          split < 82 ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        After
      </span>
      <label className="sr-only" htmlFor={labelId}>
        Compare before and after for {name}
      </label>
      <input
        id={labelId}
        type="range"
        min={8}
        max={92}
        value={Math.round(split)}
        onChange={(e) => setSplit(Number(e.target.value))}
        className="sr-only"
        aria-valuetext={`${Math.round(split)} percent before`}
      />
    </div>
  );
}

export function TransformationCard({
  name,
  quote,
  result,
  imageUrl,
  beforeImageUrl,
  imageAlt,
}: Props) {
  const interactive = Boolean(beforeImageUrl && imageUrl);

  return (
    <article className="card-depth flex h-full min-w-0 flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
      {interactive || imageUrl || beforeImageUrl ? (
        <div className="border-b border-[var(--border)] p-2.5">
          {interactive ? (
            <CompareSlider
              beforeSrc={beforeImageUrl}
              afterSrc={imageUrl}
              alt={imageAlt}
              name={name}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl || beforeImageUrl}
              alt={imageAlt || name}
              className="aspect-[6/5] w-full rounded-[2px] object-cover"
            />
          )}
        </div>
      ) : null}
      <div className="flex min-h-[9rem] flex-1 flex-col p-5">
        <p className="flex-1 text-sm leading-[1.55] text-[var(--muted)]">
          {quote}
        </p>
        <div className="mt-4 flex items-center gap-2.5">
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-[var(--accent)]"
          />
          <p className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[var(--fg)]">
            {name}
          </p>
          {result ? (
            <p className="ml-auto text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
              {result}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

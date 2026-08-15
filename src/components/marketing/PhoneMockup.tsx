"use client";

import { useEffect, useState } from "react";
import type { ChatLine } from "@/content/hero-chat";

function useShownLines(lines: ChatLine[], animated: boolean) {
  const [count, setCount] = useState(animated ? 1 : lines.length);

  useEffect(() => {
    if (!animated || lines.length === 0) return;
    if (count >= lines.length) {
      const reset = window.setTimeout(() => setCount(1), 2600);
      return () => window.clearTimeout(reset);
    }
    const id = window.setTimeout(() => setCount((c) => c + 1), 1500);
    return () => window.clearTimeout(id);
  }, [animated, count, lines.length]);

  return lines.slice(0, count);
}

export function ChatPreview({
  lines,
  name,
  avatarUrl,
  animated = false,
  className = "",
}: {
  lines: ChatLine[];
  name: string;
  avatarUrl?: string;
  animated?: boolean;
  className?: string;
}) {
  const shown = useShownLines(lines, animated);

  return (
    <div
      aria-hidden
      className={`overflow-hidden rounded-[var(--radius)] border border-white/10 bg-[#121110]/92 backdrop-blur ${className}`}
    >
      <div className="flex items-center gap-2.5 border-b border-white/10 px-3 py-2.5">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-white">
            {name.slice(0, 1)}
          </span>
        )}
        <div>
          <p className="text-xs font-semibold text-[var(--fg)]">{name}</p>
          <p className="text-[11px] text-[var(--accent)]">online</p>
        </div>
      </div>
      <div className="flex h-[172px] flex-col justify-end gap-1.5 overflow-hidden p-3">
        {shown.map((line, i) => (
          <p
            key={`${line.from}-${i}`}
            className={[
              "max-w-[92%] px-2.5 py-1.5 text-[12px] leading-[1.45]",
              line.from === "coach"
                ? "self-start rounded-[8px] rounded-tl-sm bg-[#1c1916] text-[var(--fg)]"
                : "self-end rounded-[8px] rounded-tr-sm bg-[var(--accent)] text-white",
            ].join(" ")}
          >
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
}

export function PhoneMockup({
  imageSrc,
  imageAlt,
  chat,
  chatName,
  avatarUrl,
}: {
  imageSrc: string;
  imageAlt: string;
  chat: ChatLine[];
  chatName: string;
  avatarUrl?: string;
}) {
  return (
    <div className="relative mx-auto flex w-[min(390px,86vw)] flex-col items-center min-[940px]:w-[min(500px,90vw)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={imageAlt}
        className="block h-auto w-full [mask-image:linear-gradient(to_bottom,#000_87%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_87%,transparent_100%)]"
        style={{ filter: "contrast(1.03) drop-shadow(0 20px 44px rgba(0,0,0,0.6))" }}
      />
      <ChatPreview
        lines={chat}
        name={chatName}
        avatarUrl={avatarUrl}
        animated
        className="static mt-[-6%] w-[min(300px,100%)] max-w-[300px] min-[940px]:absolute min-[940px]:bottom-[4%] min-[940px]:left-[-12%] min-[940px]:mt-0 min-[940px]:w-[min(248px,58vw)] min-[940px]:max-w-none"
      />
    </div>
  );
}

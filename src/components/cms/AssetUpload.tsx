"use client";

import { useRef, useState } from "react";

type Folder = "images" | "thumbnails" | "hero";

type Props = {
  label: string;
  value: string;
  folder?: Folder;
  kind?: "image" | "video";
  onChange: (url: string) => void;
};

export function AssetUpload({
  label,
  value,
  folder = "images",
  kind = "image",
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);
      const res = await fetch("/api/admin/assets", {
        method: "POST",
        credentials: "include",
        body,
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        setError(json.error ?? "Upload failed");
        return;
      }
      onChange(json.url);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-[var(--fg)]">{label}</span>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={uploading}
          className="rounded-md border border-[var(--border)] px-3 py-2.5 text-sm font-semibold text-[var(--fg)] disabled:opacity-60"
          onClick={() => inputRef.current?.click()}
        >
          {uploading
            ? "Uploading…"
            : value
              ? kind === "video"
                ? "Replace video"
                : "Replace image"
              : kind === "video"
                ? "Upload video"
                : "Upload image"}
        </button>
        {value ? (
          <button
            type="button"
            className="text-sm font-semibold text-red-400"
            onClick={() => onChange("")}
          >
            Remove
          </button>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept={
            kind === "video"
              ? "video/mp4,video/webm,video/quicktime"
              : "image/jpeg,image/png,image/webp,image/gif"
          }
          className="hidden"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
      </div>
      {value ? (
        kind === "video" ? (
          <div className="overflow-hidden rounded-md border border-[var(--border)]">
            <video
              src={value}
              className="max-h-40 w-full object-cover"
              muted
              playsInline
              controls
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-[var(--border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="max-h-40 w-full object-cover" />
          </div>
        )
      ) : (
        <p className="text-xs text-[var(--muted)]">
          Direct upload only — files save to public/assets/{folder}.{" "}
          {kind === "video" ? "MP4 or WebM, max 40MB." : "No image URLs."}
        </p>
      )}
      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

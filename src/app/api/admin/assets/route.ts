import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { authorizeIntegrationsRequest } from "@/lib/integrations/auth";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_VIDEO_BYTES = 40 * 1024 * 1024;
const ALLOWED_FOLDERS = new Set(["images", "thumbnails", "hero"]);
const IMAGE_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};
const VIDEO_MIME: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

function sanitizeBaseName(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "asset";
}

export async function POST(request: Request) {
  const auth = authorizeIntegrationsRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const folderRaw = String(form.get("folder") ?? "images");
  if (!ALLOWED_FOLDERS.has(folderRaw)) {
    return NextResponse.json(
      { error: "Invalid folder. Use images, thumbnails, or hero." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const isVideo = file.type.startsWith("video/");
  const ext = isVideo ? VIDEO_MIME[file.type] : IMAGE_MIME[file.type];
  if (!ext) {
    return NextResponse.json(
      {
        error: isVideo
          ? "Only MP4, WebM, and MOV videos are allowed"
          : "Only JPEG, PNG, WebP, and GIF images are allowed",
      },
      { status: 400 },
    );
  }

  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size <= 0 || file.size > maxBytes) {
    return NextResponse.json(
      {
        error: isVideo
          ? "Video must be 40MB or smaller"
          : "Image must be 12MB or smaller",
      },
      { status: 400 },
    );
  }

  const base = sanitizeBaseName(file.name);
  const filename = `${base}-${Date.now()}${ext}`;
  const dir = path.join(process.cwd(), "public", "assets", folderRaw);
  await fs.mkdir(dir, { recursive: true });
  const absolute = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(absolute, buffer);

  const url = `/assets/${folderRaw}/${filename}`;
  return NextResponse.json({
    ok: true,
    url,
    filename,
    bytes: buffer.length,
  });
}

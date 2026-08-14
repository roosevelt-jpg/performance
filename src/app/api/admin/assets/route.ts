import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { authorizeIntegrationsRequest } from "@/lib/integrations/auth";
import { getFirebaseStorage, isFirebaseConfigured } from "@/lib/firebase/admin";

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
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!isFirebaseConfigured()) {
    return NextResponse.json(
      { error: "Firebase is not configured. Set the Firebase Admin environment variables." },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const folderRaw = String(form.get("folder") ?? "images");
  if (!ALLOWED_FOLDERS.has(folderRaw)) {
    return NextResponse.json({ error: "Invalid folder. Use images, thumbnails, or hero." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Missing file" }, { status: 400 });

  const isVideo = file.type.startsWith("video/");
  const ext = isVideo ? VIDEO_MIME[file.type] : IMAGE_MIME[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: isVideo ? "Only MP4, WebM, and MOV videos are allowed" : "Only JPEG, PNG, WebP, and GIF images are allowed" },
      { status: 400 },
    );
  }

  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size <= 0 || file.size > maxBytes) {
    return NextResponse.json(
      { error: isVideo ? "Video must be 40MB or smaller" : "Image must be 12MB or smaller" },
      { status: 400 },
    );
  }

  const filename = `${sanitizeBaseName(file.name)}-${Date.now()}${ext}`;
  const objectPath = `assets/${folderRaw}/${filename}`;
  const token = randomUUID();
  const bucket = getFirebaseStorage().bucket();
  const object = bucket.file(objectPath);
  const buffer = Buffer.from(await file.arrayBuffer());

  await object.save(buffer, {
    resumable: false,
    contentType: file.type,
    metadata: { metadata: { firebaseStorageDownloadTokens: token } },
  });

  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`;
  return NextResponse.json({ ok: true, url, filename, bytes: buffer.length });
}

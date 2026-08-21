import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { get, put } from "@vercel/blob";

const memory = new Map<string, unknown>();
const BLOB_PREFIX = "tfp-persist/";

function dataFile(name: string): string {
  return path.join(process.cwd(), "data", name);
}

function tmpFile(name: string): string {
  return path.join(os.tmpdir(), `tfp-${name}`);
}

function blobPathname(name: string): string {
  return `${BLOB_PREFIX}${name}`;
}

function blobToken(): string | undefined {
  // Accept the standard SDK name plus Formula / Performance-prefixed store tokens.
  return (
    process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
    process.env.PERFORMANCE_BLOB_READ_WRITE_TOKEN?.trim() ||
    process.env.FORMULA_BLOB_READ_WRITE_TOKEN?.trim() ||
    undefined
  );
}

function blobStoreId(): string | undefined {
  return (
    process.env.PERFORMANCE_STORE_ID?.trim() ||
    process.env.PERFORMANCE_BLOB_STORE_ID?.trim() ||
    process.env.BLOB_STORE_ID?.trim() ||
    process.env.FORMULA_BLOB_STORE_ID?.trim() ||
    undefined
  );
}

function blobAuthOptions(): { token: string; storeId?: string } | null {
  const token = blobToken();
  if (!token) return null;
  const storeId = blobStoreId();
  return storeId ? { token, storeId } : { token };
}

async function readJsonFile<T>(file: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function readFromBlob<T>(name: string): Promise<T | null> {
  const auth = blobAuthOptions();
  if (!auth) return null;
  try {
    const result = await get(blobPathname(name), {
      access: "private",
      token: auth.token,
      ...(auth.storeId ? { storeId: auth.storeId } : {}),
      useCache: false,
    });
    if (!result?.stream) return null;
    const text = await new Response(result.stream).text();
    if (!text.trim()) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function writeToBlob(
  name: string,
  payload: string,
): Promise<{ ok: true; url: string } | { ok: false }> {
  const auth = blobAuthOptions();
  if (!auth) return { ok: false };
  try {
    const blob = await put(blobPathname(name), payload, {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      token: auth.token,
      ...(auth.storeId ? { storeId: auth.storeId } : {}),
    });
    return { ok: true, url: blob.url };
  } catch {
    return { ok: false };
  }
}

export async function readPersistedJson<T>(name: string): Promise<T | null> {
  if (memory.has(name)) return memory.get(name) as T;

  const fromDisk =
    (await readJsonFile<T>(dataFile(name))) ??
    (await readFromBlob<T>(name)) ??
    (await readJsonFile<T>(tmpFile(name)));

  if (fromDisk) memory.set(name, fromDisk);
  return fromDisk;
}

export async function writePersistedJson<T>(
  name: string,
  value: T,
): Promise<{ durable: boolean; path: string; writable: boolean }> {
  memory.set(name, value);
  const payload = `${JSON.stringify(value, null, 2)}\n`;

  try {
    await fs.mkdir(path.dirname(dataFile(name)), { recursive: true });
    await fs.writeFile(dataFile(name), payload, "utf8");
    // Mirror to Blob when available so production and local stay aligned.
    await writeToBlob(name, payload);
    return { durable: true, path: `data/${name}`, writable: true };
  } catch {
    const blob = await writeToBlob(name, payload);
    if (blob.ok) {
      return {
        durable: true,
        path: "durable cloud storage",
        writable: true,
      };
    }
    try {
      await fs.writeFile(tmpFile(name), payload, "utf8");
      return {
        durable: false,
        path: "temporary host storage",
        writable: true,
      };
    } catch {
      return { durable: false, path: "session memory", writable: true };
    }
  }
}

export async function persistMeta(name: string): Promise<{
  fileExists: boolean;
  path: string;
  writable: boolean;
  durable: boolean;
}> {
  const hasBlob = Boolean(blobToken());
  let fileExists = memory.has(name);
  try {
    await fs.access(dataFile(name));
    fileExists = true;
  } catch {
    if (!fileExists && hasBlob) {
      const fromBlob = await readFromBlob<unknown>(name);
      fileExists = fromBlob != null;
    }
  }

  let localDurable = false;
  try {
    const dir = path.dirname(dataFile(name));
    await fs.mkdir(dir, { recursive: true });
    const probe = path.join(dir, ".write-probe");
    await fs.writeFile(probe, "ok");
    await fs.unlink(probe);
    localDurable = true;
  } catch {
    localDurable = false;
  }

  const durable = localDurable || hasBlob;

  return {
    fileExists,
    path: localDurable
      ? `data/${name}`
      : hasBlob
        ? "durable cloud storage"
        : "host storage",
    writable: true,
    durable,
  };
}

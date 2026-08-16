import { promises as fs } from "fs";
import os from "os";
import path from "path";

const memory = new Map<string, unknown>();

function dataFile(name: string): string {
  return path.join(process.cwd(), "data", name);
}

function tmpFile(name: string): string {
  return path.join(os.tmpdir(), `tfp-${name}`);
}

async function readJsonFile<T>(file: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function readPersistedJson<T>(name: string): Promise<T | null> {
  if (memory.has(name)) return memory.get(name) as T;
  const fromDisk =
    (await readJsonFile<T>(dataFile(name))) ??
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
    return { durable: true, path: `data/${name}`, writable: true };
  } catch {
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
  let fileExists = false;
  try {
    await fs.access(dataFile(name));
    fileExists = true;
  } catch {
    fileExists = memory.has(name);
  }

  let durable = false;
  try {
    const dir = path.dirname(dataFile(name));
    await fs.mkdir(dir, { recursive: true });
    const probe = path.join(dir, ".write-probe");
    await fs.writeFile(probe, "ok");
    await fs.unlink(probe);
    durable = true;
  } catch {
    durable = false;
  }

  return {
    fileExists,
    path: durable ? `data/${name}` : "host storage",
    writable: true,
    durable,
  };
}

import { describe, expect, it } from "vitest";
import {
  persistMeta,
  readPersistedJson,
  writePersistedJson,
} from "./jsonFile";

describe("persisted json", () => {
  it("saves incomplete payloads and reads them back", async () => {
    const name = `test-${Date.now()}.json`;
    const saved = { shop: "theformulaperformance.com", ghl: "" };
    const result = await writePersistedJson(name, saved);
    expect(result.writable).toBe(true);
    await expect(readPersistedJson(name)).resolves.toEqual(saved);
    const meta = await persistMeta(name);
    expect(meta.writable).toBe(true);
  });
});

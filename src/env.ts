import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

// Phase 1 scope only (see /root/.claude/plans/atomic-hugging-minsky.md) — just
// the shared-database connection. GHL/Stripe/Resend/WhatsApp credentials move
// here in Phase 5, once the Blob-backed integrations store is retired; adding
// them earlier would fail the build before those phases are ready to use them.
export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // Shared Postgres — same instance the-formula-programme uses, not a
    // separate database. DATABASE_URL is the pooled (Supavisor transaction
    // mode) connection; DIRECT_URL is used by migrations only.
    DATABASE_URL: z.url(),
    DIRECT_URL: z.url(),
    DB_POOL_MAX: z.coerce.number().int().positive().default(1),
  },
  client: {},
  experimental__runtimeEnv: {},
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});

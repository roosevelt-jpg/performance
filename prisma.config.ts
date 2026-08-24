import { defineConfig } from "prisma/config";

// Mirrors the-formula-programme's prisma.config.ts — CLI commands (migrate
// diff/dev/deploy) use DIRECT_URL, the app's own client (src/db/index.ts)
// uses the pooled DATABASE_URL via @prisma/adapter-pg. Same shared database,
// see /root/.claude/plans/atomic-hugging-minsky.md.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? "",
  },
});

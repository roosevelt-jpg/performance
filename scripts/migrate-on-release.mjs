import { execSync } from "node:child_process";

// Only the Vercel production build may touch the prod database; CI and
// preview builds run against throwaway or placeholder DATABASE_URLs.
// Mirrors the-formula-programme's script of the same name — this branch's
// preview deploys are safe no-ops until it's merged to master.
if (process.env.VERCEL_ENV === "production") {
  execSync("prisma migrate deploy", { stdio: "inherit" });
} else {
  console.log("Skipping prisma migrate deploy: not a Vercel production build.");
}

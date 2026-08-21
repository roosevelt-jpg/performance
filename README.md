# Pro & Elite booking funnel — The Formula Performance

Greenfield Next.js (App Router) implementation of the Pro/Elite lead-qualification funnel.

## Section 8 assumptions (swap in one place)

See `src/lib/config/assumptions.ts` and `.env.example`.

| Item | Assumed value | Where to change |
|------|---------------|-----------------|
| Pro / Elite prices | £449 / £599 (Q9 only) | `NEXT_PUBLIC_PRICE_PRO` / `NEXT_PUBLIC_PRICE_ELITE` |
| Entry tier below Challenge | Off (3 cards) | `NEXT_PUBLIC_SHOW_ENTRY_TIER` + `src/lib/content/tier-cards.ts` |
| Calendar platform | GoHighLevel | `NEXT_PUBLIC_CALENDAR_PLATFORM=ghl\|calendly` |
| Card copy | Spec Section 2 | `src/lib/content/tier-cards.ts` |

## Routes

- `/` — landing + tier row (Challenge checkout CTA; Pro/Elite → Book Your Call only)
- `/book?tier=pro|elite` — questionnaire (tier persisted in session)
- `/book/calendar` — inline calendar after qualify (not linked from nav)
- `/book/confirmation` — exact confirmation copy + WhatsApp opt-in
- `/challenge` — Challenge page; disqualified leads land here with reason
- `/integrations` — pre go-live hub for GHL, calendar embeds, pricing, product flags

## Admin

Admin login reads **`ADMIN_USERNAME`** and **`ADMIN_PASSWORD`** from the server environment (your host’s **Environment Variables** panel). They are not stored in the repo.

After deploying to a new host or domain, set at minimum:

| Variable | Example | Environments |
|----------|---------|--------------|
| `ADMIN_USERNAME` | `admin` | Production, Preview, Development |
| `ADMIN_PASSWORD` | your password | Production, Preview, Development |
| `ADMIN_SESSION_SECRET` | long random string | Production, Preview, Development |
| `NEXT_PUBLIC_SITE_URL` | `https://train.theformulaperformance.com` | Production, Preview, Development |
| `BLOB_READ_WRITE_TOKEN` | from Storage → Blob | Production, Preview, Development |

Then **Redeploy** production. Until those vars exist, `/admin/login` shows “credentials not configured”.

**Important:** on serverless hosts, Admin → Integrations / Content saves need `BLOB_READ_WRITE_TOKEN` so credentials and CMS survive redeploys. Create a Blob store in the project Storage tab, copy the token into env, redeploy, then save Integrations again.

1. Copy `.env.example` to `.env.local` for local dev and set the same vars
2. Open `/admin/login`
3. **Content CMS** (`/admin/content`) — edit brand, nav, hero, banners, videos, tiers, CTAs, funnel copy
4. **Integrations** (`/admin/integrations`) — GHL, calendar embeds, Q9 pricing

CMS saves to `data/cms.local.json` (gitignored). Live site reads via `/api/public-cms`.

## Commands

```bash
npm run dev
npm test
npm run build
```

## Non-negotiable

No price and no checkout for Pro or Elite on public pages. Challenge checkout is the only self-serve path.

# Pro & Elite booking funnel — The Formula Performance

Greenfield Next.js (App Router) implementation of the Pro/Elite lead-qualification funnel.

## Section 8 assumptions (swap in one place)

See `src/lib/config/assumptions.ts` and `.env.example`.

| Item | Assumed value | Where to change |
|------|---------------|-----------------|
| Pro / Elite prices | £297 / £497 (Q9 only) | `NEXT_PUBLIC_PRICE_PRO` / `NEXT_PUBLIC_PRICE_ELITE` |
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

1. Copy `.env.example` to `.env.local` and set `ADMIN_USERNAME` / `ADMIN_PASSWORD`
2. Open `/admin/login` with those credentials
3. **Content CMS** (`/admin/content`) — edit brand, nav, hero, banners, videos, tiers, CTAs, funnel copy
4. **Integrations** (`/admin/integrations`) — GHL, calendar embeds, Q9 pricing

CMS and integration settings persist in Firestore; admin uploads go to Firebase Storage. Configure the four `FIREBASE_*` variables from `.env.example` as server-only environment variables. Live site reads CMS content via `/api/public-cms`.

## Commands

```bash
npm run dev
npm test
npm run build
```

## Non-negotiable

No price and no checkout for Pro or Elite on public pages. Challenge checkout is the only self-serve path.

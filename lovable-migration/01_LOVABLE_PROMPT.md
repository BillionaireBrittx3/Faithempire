# MASTER PROMPT FOR LOVABLE

Copy everything below this line into Lovable as your first message, with documents 02–05 attached.

---

Build a complete, production-ready mobile-first PWA called **Decoded Faith Empire** — a Christian faith app that delivers the Bible "decoded" into modern plain language. This is an EXACT rebuild of an existing live app whose iOS App Store wrapper (App ID 6759208291) loads it in a WebView, so every detail below must match precisely: routes, localStorage key names, API paths, subscription gating rules, and the native WebView message bridge. Do not improvise, rename, or "improve" anything unless I explicitly ask.

I have attached four specification documents. Treat them as the source of truth:
- **02_APP_SPEC.md** — every page, feature, and rule
- **03_DESIGN_SYSTEM.md** — exact colors, fonts, layout
- **04_BACKEND_API_SPEC.md** — API endpoints, database schema, external services
- **05_NATIVE_IAP_BRIDGE.md** — the WebView subscription bridge (must be byte-for-byte compatible)

## App summary

A dark, premium-feeling, gold-on-black mobile app (max content width 512px, bottom tab bar) with:

1. **Home** — today's decoded verse of the day (from database, keyed to day-of-year), with share and favorite actions.
2. **365-Day Devotional** (`/devotional`) — daily devotional with theme, title, scripture, decoded message, reflection, prayer, journal (localStorage, 5,000 char max with counter), and activity. Days 1–7 free; day 8+ premium. Progress tracking with completion checkmarks and a day-picker calendar.
3. **KJV Bible reader** (`/bible`) — all 66 books, chapters fetched from bible-api.com through my backend, verse highlighting, favorites, search, adjustable font size, text-to-speech with continuous chapter auto-advance. Genesis free; every other book premium.
4. **Decoded Bible (DMLV)** (`/decoded` and `/decoded/:bookSlug`) — all 66 books decoded verse-by-verse into modern language (JSON data files I will upload), organized into 4 series: The Law, History, Wisdom/Poetry & Prophets, The New Testament. KJV and decoded text shown side by side. Genesis free; the rest premium.
5. **Prayers** (`/prayers`) — themed prayer collections (Healing, Strength, Family, Depression & Anxiety, New Beginnings, etc.) plus a rotating free Morning Prayer and Evening Prayer (rotation derived from day-of-year; only those 2 free, all themed sections premium). Daily prayer reminder notifications (Notification API + service worker, time picker, localStorage config).
6. **Podcast** (`/podcast`) — episodes parsed from RSS feed `https://anchor.fm/s/10ee7543c/podcast/rss`, with a global persistent audio player that survives navigation. ALL episodes are premium (0 free).
7. **Favorites** (`/favorites`) and **Archive** (`/archive`) — both entirely premium-gated.
8. **Paywall** (`/premium`) plus a reusable paywall modal — $8.88/month subscription "Faith Empire Premium", product ID `com.decodedfaithempire.app.premium.monthly`, purchased through Apple in-app purchase via the WebView bridge in doc 05. Includes hidden owner unlock: tapping the logo 7 times reveals a PIN input; PIN `8888` sets owner access.
9. **About** (`/about`), **Privacy** (`/privacy`), **Terms** (`/terms`) — static pages.
10. **PWA** — manifest, service worker with offline caching (cache-first static, network-first API with cache fallback), installable, `apple-itunes-app` smart banner for app-id=6759208291.

## Non-negotiable compatibility requirements

- Use the EXACT localStorage keys listed in 02_APP_SPEC.md (e.g. `faith_empire_premium`, `faith-empire-favorites`, `faith-empire-highlights`…). Existing users' devices already contain data under these keys.
- Use the EXACT API paths in 04_BACKEND_API_SPEC.md (`/api/verses/today`, `/api/bible/:book/:chapter`, `/api/decoded/...`, `/api/prayers`, `/api/podcast/episodes`, `/api/subscribe`, …).
- Implement the WebView subscription bridge EXACTLY as in 05_NATIVE_IAP_BRIDGE.md (`CHECK_SUBSCRIPTION`, `PURCHASE`, `RESTORE_PURCHASES` outbound; `SUBSCRIPTION_STATUS`, `PURCHASE_COMPLETE`, `PURCHASE_FAILED`, `RESTORE_COMPLETE` inbound), including the owner bypass URL param `?dfe_owner=brittany8888` and preview token param `?preview=mutimanwa-preview-2026` (expires 2036-03-08).
- Never show web payment UI inside the WebView — subscriptions go through Apple IAP only via the bridge. On the plain web, the subscribe button may deep-link to the App Store page `https://apps.apple.com/app/id6759208291`.
- Store the two database tables (`verses`, `subscribers`) in Supabase with the exact column set in 04_BACKEND_API_SPEC.md; I will upload the data exports to seed them.

## Data I will upload

- `devotional.json` (365 days), `decoded/` (67 JSON files incl. index), `prayers/` (9 themed files), `verses-export.json` (100 rows), `subscribers-export.json`.

Build the full app, then walk me through importing the data files. Ask me for the uploads when you're ready.

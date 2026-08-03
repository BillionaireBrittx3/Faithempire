# Decoded Faith Empire → Lovable Migration Package

This folder contains EVERYTHING needed for lovable.dev to rebuild this app from scratch with zero prior knowledge, plus all of the app's data.

## Important facts before you start (read this!)

1. **There is no Supabase in this app.** The app uses a standard PostgreSQL database (hosted by Replit) — only 2 small tables (`verses` and `subscribers`). Lovable's native database IS Supabase, so on Lovable these two tables will simply be created in Supabase. Full exports are included in `data/`.
2. **There is no cloud backup/sync.** All user data (favorites, highlights, journal entries, reading progress, settings) is stored in the browser's localStorage on the device. The rebuilt app must use the EXACT same localStorage key names (documented in 02_APP_SPEC.md) so existing users lose nothing.
3. **The App Store app will NOT be affected — as long as one rule is followed.** The iOS app (App ID 6759208291) is a native wrapper that loads the website `https://faithempire.replit.app` inside a WebView. It will keep working untouched while you build on Lovable. The App Store app only changes if/when you point the wrapper at the new Lovable URL — see 05_NATIVE_IAP_BRIDGE.md for the exact bridge protocol the new site MUST implement before you ever switch the URL.

## Contents

| File | What it is |
|---|---|
| `01_LOVABLE_PROMPT.md` | The master prompt to paste into Lovable |
| `02_APP_SPEC.md` | Every page, feature, rule, and localStorage key |
| `03_DESIGN_SYSTEM.md` | Exact colors, fonts, spacing, layout |
| `04_BACKEND_API_SPEC.md` | Every API endpoint, DB schema, env vars, external services |
| `05_NATIVE_IAP_BRIDGE.md` | The WebView ↔ native message protocol (CRITICAL for App Store) |
| `06_MIGRATION_STEPS.md` | Step-by-step order of operations & go-live checklist |
| `data/devotional.json` | All 365 devotional days |
| `data/decoded/` | All 66 decoded Bible books + `books-index.json` |
| `data/prayers/` | All themed prayer collections (9 files) |
| `data/verses-export.json` | Full export of the `verses` database table (100 rows) |
| `data/subscribers-export.json` | Full export of the `subscribers` table |

## How to use

1. Create a new Lovable project.
2. Paste `01_LOVABLE_PROMPT.md` as your first message.
3. Attach/upload `02` through `05` (Lovable reads attached docs). If it can't take them all at once, feed them in the order listed.
4. Upload the `data/` files when Lovable asks for content (it will — the prompt tells it to).
5. Follow `06_MIGRATION_STEPS.md` to verify and (only when ready) point the mobile app at the new URL.

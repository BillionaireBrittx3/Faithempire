# 06 — MIGRATION STEPS & GO-LIVE CHECKLIST

## Phase 1 — Build on Lovable (App Store app untouched)
1. New Lovable project → paste `01_LOVABLE_PROMPT.md`, attach docs 02–05.
2. Let Lovable scaffold the app; create the Supabase tables per doc 04.
3. Upload data when asked:
   - `data/verses-export.json` → seed `verses` table (100 rows; keep verse_number values).
   - `data/subscribers-export.json` → seed `subscribers`.
   - `data/devotional.json` → bundle as static app data (365 days).
   - `data/decoded/` (67 files incl. `books-index.json`) → serve via the decoded endpoints.
   - `data/prayers/` (9 TypeScript data files) → convert to the aggregated `/api/prayers` source.
4. Set the `ADMIN_EXPORT_KEY` secret in Lovable (pick a new strong value; the old one stays on the old site).

## Phase 2 — Verify (side-by-side against the live site)
Open the current live app and the Lovable preview together and confirm:
- [ ] All 14 routes render and match visually (black/gold, serif headings, tab bar).
- [ ] `/api/verses/today` shows the SAME verse on both (same day-of-year formula).
- [ ] Bible: Genesis free, other books locked; chapter loads; highlight persists after reload; search works; TTS + continuous play works.
- [ ] Decoded: 66 books, 4 series, Genesis chapter shows KJV + decoded pairs.
- [ ] Devotional: day 7→8 lock boundary; journal saves per day with 5,000-char cap.
- [ ] Prayers: 2 free daily prayers match the rotation; sections in the exact order; reminder notification fires.
- [ ] Podcast: episodes load and the mini-player persists across navigation; all episodes locked when free.
- [ ] Paywall: Subscribe (browser → App Store link), 7-tap + PIN 8888 unlock, `?dfe_owner=brittany8888` and `?preview=mutimanwa-preview-2026` both grant access and strip from the URL.
- [ ] Fresh-device test: clear localStorage, confirm free experience is correct.
- [ ] PWA: installable, works offline after first visit (previously viewed content).
- [ ] `/.well-known/apple-app-site-association` served as JSON.

## Phase 3 — Domain & wrapper switch (ONLY when Phase 2 is 100%)
1. Decide the final domain (e.g. keep `decodedfaithempire.org` and point it at the Lovable deployment). If the wrapper will load the same domain it does today, updating DNS switches the App Store app instantly — so do NOT change DNS until everything passes.
2. If using a new URL instead: edit the wrapper (`faith-empire-app/App.js`, `const APP_URL = ...`) → new EAS build → submit to App Store Connect → release. Old app versions keep loading the old URL, so keep the old site up until adoption completes.
3. After switch, test ON A REAL iPHONE with the App Store build: subscription status check, purchase (sandbox), restore purchases.
4. Keep the Replit app running as a fallback for at least a few weeks.

## What does NOT transfer (and why that's OK)
- **User favorites/highlights/journals/progress**: stored on each user's device in localStorage — nothing to migrate server-side. Because the new app uses identical keys AND (if you keep the same domain) the same origin, users keep their data automatically. ⚠️ If you change domains, localStorage does NOT carry over (it is origin-bound) — keeping the same domain is strongly recommended.
- **Supabase**: the current app has no Supabase; its Postgres data is fully exported in `data/`. Lovable will put it in its own Supabase.
- **Apple subscription status**: lives with Apple, not the website. Users' premium unlocks re-verify automatically through the bridge (doc 05).

## Assets to also bring over (grab from GitHub/current site)
- Logo PNG (`attached_assets/Copy_of_EPRODUCTS_EMPIRE_PODCAST_(98)_1770693543975.png`).
- `/icon-192.png`, `/icon-512.png` app icons.
- `APP_STORE_METADATA.md` (App Store listing copy) — unchanged, listing is not affected.

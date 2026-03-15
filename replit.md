# Faith Empire - Daily Bible Verse & Decoded Message App

## Overview
Faith Empire is a mobile-first Progressive Web App (PWA) for decodedfaithempire.org that delivers a fresh Bible verse and plain-language motivational message every day. Built with React + Express + PostgreSQL.

## Recent Changes
- 2026-03-15: Added Listen Along (text-to-speech) feature using browser SpeechSynthesis API. Bible reader has play/pause/stop controls with speed adjustment (0.75x/1x/1.35x). Decoded books have additional mode toggle to listen to either the decoded version or original KJV. Active verse highlights as it's read aloud. Files: `client/src/lib/use-speech.ts` (hook), `client/src/components/speech-controls.tsx` (UI controls).
- 2026-03-14: Added 8 web-side improvements: (1) Bible verse search — search bar to jump to any reference; (2) Font size control — small/medium/large persisted in localStorage, available in Bible reader, decoded books, and Settings; (3) Prayer book page at /prayers — all 100 prayers organized by 10 sections with expand/collapse; (4) Highlight navigation — tapping a highlight in Favorites navigates to that chapter in Bible or decoded book; (5) Bible chapter caching — chapters cached in localStorage for 7 days; (6) Persistent podcast player — audio context moved to global provider, player bar persists across navigation; (7) Reading progress for decoded books — chapters marked read in localStorage, progress bar and checkmarks shown; (8) New verse notification badge — gold dot on Today tab when a new verse is available after midnight ET.
- 2026-03-11: Redesigned paywall with real content previews. Non-subscribers now see: today's verse preview (truncated with gradient fade), 66 decoded books grid, KJV Bible book list, podcast preview, and features list. Sticky subscribe button at bottom. Uses actual API data for today's verse.
- 2026-03-07: Changed to subscription-only model ($8.88/month). All content now requires active subscription. Global SubscriptionGate in App.tsx redirects non-subscribers to paywall. FREE_DECODED_CHAPTERS=0, FREE_PODCAST_EPISODES=0. Updated paywall, terms, about page with new pricing and copy. Removed "Free Features" section from paywall.
- 2026-03-05: Updated all 27 New Testament decoded books from corrected PDF sources (Matthew standalone + Series IV). Mark now has all 16 chapters (was 6), John now has all 21 chapters (was 3), Matthew at 100% coverage (1071 verses). Cleaned 311 instances of chapter header contamination from verse text. All decoded translations now match corrected DMLV content.
- 2026-02-27: Switched from Vite dev server to pre-built production mode for stability. Vite's esbuild child process was crashing persistently in the Replit environment. Server now always serves pre-built static files from `dist/public/`. Run `npm run build` before `npm run start` (or `npm run dev`). The `.replit` workflow uses `npm run start` directly.
- 2026-02-26: Fixed server crash stability issues: (1) SIGHUP signal handler added. Server now stays stable.
- 2026-02-26: Fixed 7,127 KJV text accuracy issues across 55 decoded books: 313 truncated verses restored, 4 empty verses filled, 5,510 LORD/Lord case corrections, "THE END." removed from Revelation 22:21.
- 2026-02-26: Expanded Decoded section from 1 book (Genesis) to all 66 books of the Bible. Each book parsed from DOCX files with KJV + DMLV (Decoded Modern Language Version) text. Books organized by Old Testament / New Testament sections on landing page. Dynamic routing via `/decoded/:bookSlug`. Data stored as JSON in `server/data/decoded/`.
- 2026-02-26: Created custom local Expo module (storekit-module) with pure Swift StoreKit wrapper, replacing deprecated expo-in-app-purchases and react-native-iap. EAS build v1.1.0 succeeded (build 11).
- 2026-02-25: Added premium subscription system ($12.22/month Apple IAP). Paywall UI at /premium, content gating on decoded chapters (3 free) and podcast episodes (2 free), subscription context with WebView-to-native bridge, restore purchases support.
- 2026-02-13: Added KJV Bible reader with 66 books, chapter navigation, tap-to-highlight verses (localStorage). Reorganized tabs: Today, Bible, Podcast, Saved, More.
- 2026-02-10: Initial MVP built with 100 seeded verses, 4 pages, bottom tab navigation, dark/light mode, email subscription

## Server Stability
- **Production mode always**: Server always serves pre-built static files (no Vite dev server). This avoids esbuild child process crashes.
- **SIGHUP handler**: `process.on("SIGHUP", () => {})` in server/index.ts prevents signal-based crashes
- **Build before serve**: Always run `npm run build` before starting. The workflow uses `npm run start` (production mode).
- **Static fallback**: `server/static.ts` checks both `__dirname/public` (production build) and `dist/public` (dev with tsx) for the build directory.

## Architecture
- **Frontend**: React (Vite) with Tailwind CSS, Shadcn UI components, Framer Motion animations
- **Backend**: Express.js with REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Fonts**: Playfair Display (headings), Inter (body), Lora (verse text), DM Sans (decoded messages)
- **Colors**: Black background (#000000), Gold accent (#DFAC2A / HSL 43 88% 51%)

## Key Pages
- `/` - Today's verse (home) - always free
- `/bible` - KJV Bible reader (66 books, chapter navigation, tap-to-highlight, verse search, font size, chapter caching) - always free
- `/prayers` - Prayer book with 100 prayers in 10 sections - always free
- `/archive` - Browse all decoded verses with category filtering (accessible from More page)
- `/favorites` - Saved verses + Bible highlights (two tabs, localStorage, highlight navigation)
- `/podcast` - Podcast episodes with persistent global audio player (first 2 free, rest premium)
- `/decoded` - Decoded Books landing page (all 66 books organized by OT/NT sections)
- `/decoded/:bookSlug` - Individual decoded book reader with reading progress tracking
- `/about` - Brand info, subscribe, social links, settings (dark mode + font size), prayer book link, quick links
- `/premium` - Paywall/subscription page ($12.22/month Apple IAP)

## Decoded Books System
- **Data**: 66 JSON files in `server/data/decoded/` (one per book, ~11MB total)
- **Index**: `server/data/decoded/books-index.json` lists all books with stats
- **Format**: Each book JSON has chapters array, each chapter has verses with `kjv`, `decoded`, `context` fields
- **Genesis**: Original file with context annotations preserved
- **Caching**: Books loaded lazily and cached in memory via `decodedBooksCache` Map
- **Series**: I (Genesis-Deuteronomy), II (Joshua-Job), III (Psalms-Malachi), IV (Matthew-Revelation)

## Subscription System
- **Product ID**: com.decodedfaithempire.app.premium.monthly
- **Price**: $8.88/month (Apple IAP auto-renewable subscription)
- **Model**: Subscription-only (all content gated behind paywall)
- **Gating**: All content requires active subscription (SubscriptionGate in App.tsx), only /premium, /privacy, /terms are public
- **Tech**: WebView-to-native bridge via postMessage, custom StoreKit module (modules/storekit-module/), localStorage for state persistence
- **Files**: client/src/lib/subscription.tsx (context), client/src/pages/paywall.tsx (UI), client/src/components/premium-lock.tsx (gating), faith-empire-app/App.js (native bridge)

## Navigation (Bottom Tab Bar)
- Today, Bible, Podcast, Decoded, More
- Saved Verses & Highlights accessible from More page Quick Links

## API Endpoints
- `GET /api/verses/today` - Returns today's verse (rotates by day of year)
- `GET /api/verses/archive` - Returns all verses
- `GET /api/verses/:id` - Returns verse by number
- `GET /api/bible/:book/:chapter` - Proxies KJV Bible text from bible-api.com
- `GET /api/decoded/books` - Returns index of all 66 decoded books with stats
- `GET /api/decoded/:bookSlug` - Returns decoded book summary (chapters list with titles, verse counts)
- `GET /api/decoded/:bookSlug/:chapter` - Returns chapter data with verses (kjv, decoded, context)
- `GET /api/prayers` - Returns all 100 prayers with title, text, section
- `POST /api/subscribe` - Email subscription

## Database Tables
- `verses` - id, verse_number, reference, verse_text, decoded_message, category, book, prayer_title, prayer_text, prayer_section
- `subscribers` - id, email, first_name, subscribed_at, active, source

## Prayer Book Integration
- 100 prayers from "No Weapon Formed When You Pray, Heaven Moves" paired 1:1 with the 100 daily verses
- Prayer data extracted and stored in `server/prayers-data.ts`, seeded to DB via `server/seed-prayers.ts`
- Sections: Prayers of Protection (1-10), Prayers Against Mental Warfare (11-20), Prayers for Purpose and Destiny (21-30), Prayers for Family and Relationships (31-40), Prayers for Finances and Provision (41-50), Prayers for Health and Healing (51-60), Prayers for Faith and Trust (61-70), Prayers for Forgiveness and Deliverance (71-80), Prayers for Business and Ministry (81-90), Prayers of Victory and Praise (91-100)
- Displayed in VerseCard component as expandable "Today's Prayer" section below the decoded message

## User Preferences
- Dark mode by default (matches brand), toggleable in About page
- Font size (small/medium/large) stored in localStorage, applies to Bible reader and decoded books
- Favorites stored in localStorage (no account required)
- Reading progress for decoded books stored in localStorage
- Bible chapter cache (7-day expiry) in localStorage
- New verse notification badge state in localStorage
- Mobile-first design with bottom tab navigation

## New Feature Files
- `client/src/lib/font-size.ts` - Font size preference management
- `client/src/lib/reading-progress.ts` - Decoded book reading progress tracking
- `client/src/lib/bible-cache.ts` - Bible chapter localStorage caching
- `client/src/lib/audio-context.tsx` - Global audio player context provider
- `client/src/lib/use-speech.ts` - Text-to-speech hook (SpeechSynthesis API)
- `client/src/components/global-player.tsx` - Persistent podcast player bar
- `client/src/components/speech-controls.tsx` - Listen Along UI controls
- `client/src/pages/prayers.tsx` - Prayer book page with 10 sections

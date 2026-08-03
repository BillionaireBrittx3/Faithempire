# 02 — COMPLETE APP SPECIFICATION

App name: **Decoded Faith Empire** (by Brittany Johnson, decodedfaithempire.org)
Platform: mobile-first PWA rendered inside an iOS App Store WebView wrapper (App ID 6759208291) and directly on the web.
Layout: single column, max width `max-w-lg` (512px) centered, sticky top header, fixed bottom tab bar, page content has `pb-20` bottom padding so the tab bar never covers it.

---

## 1. Global shell

### Header (sticky top, all pages)
- Left: app logo image (gold "Decoded Faith Empire" emblem) — clicking it navigates to `/` (Home). ~32px tall.
- Right: search icon button that opens an animated (framer-motion) full-width search overlay for Bible search — typing queries `GET /api/bible/search?q=...`; results show reference + verse text; tapping a result navigates to that book/chapter in the Bible reader. Overlay closes on X or backdrop tap.

### Bottom tab bar (fixed, 6 tabs, min 44×44px tap targets)
| Path | Label | Icon (lucide) |
|---|---|---|
| `/` | Today | BookOpen |
| `/devotional` | 365 Days | CalendarDays |
| `/bible` | Bible | Book |
| `/prayers` | Prayers | HandHeart |
| `/decoded` | custom cross icon, label "Decoded" | (custom SVG cross) |
| `/about` | More | Menu |

Active tab: gold (`primary`) icon + label; inactive: muted. "Today" tab shows a small gold dot badge when a new daily verse hasn't been viewed yet. `/about` tab is active for `/about`, `/privacy`, `/terms`. Prefix matching for other tabs.

### Routes (wouter-style, exact)
`/` Home · `/devotional` · `/bible` · `/prayers` · `/podcast` · `/decoded` · `/decoded/:bookSlug` · `/archive` · `/favorites` · `/premium` (paywall) · `/about` · `/privacy` · `/terms` · 404 not-found.
Pages are lazy-loaded (code-split) with a centered spinner Suspense fallback. Whole app wrapped in an ErrorBoundary showing a friendly reload screen. Per-page `document.title` set as `"<Page> · Decoded Faith Empire"` (base title: "Decoded Faith Empire — Your Daily Decoded Message").

### Global providers
QueryClient (TanStack Query; default fetcher uses queryKey[0] as URL) → Theme (dark default) → Subscription → PaywallModal → AudioPlayer (global) → Toaster.

---

## 2. Pages

### 2.1 Home `/` ("Today")
- Fetches `GET /api/verses/today` → today's verse `{id, verseNumber, reference, verseText, decodedMessage, category, book}`.
- Hero card: today's date, category badge, KJV verse text (serif), reference, then the "Decoded Message" section in modern language.
- Actions: **favorite** (heart toggle, stores full verse object in localStorage `faith-empire-favorites`), **share** (generates a branded 1080×1080 share image on canvas — black background, gold accents, verse + decoded text + app name — and uses Web Share API with file, falling back to sharing text/copying).
- Quick-link cards to Devotional, Bible, Decoded, Prayers, Podcast.
- FREE for everyone.

### 2.2 Devotional `/devotional` ("365 Days · Closer to God")
Data: static `devotional.json` (365 entries). Entry shape:
`{ day, week, theme, title, decoded, reflection, prayer, journal (prompt), activityName, activity, scriptureText, scriptureRef }`.
- Shows one day at a time: theme label (e.g. "FAITH"), Day N heading, title, scripture (serif quote + reference), sections: **Decoded**, **Reflection**, **Prayer**, **Journal** (textarea persisted per-day in localStorage key `faith-empire-journal-<day>`, max 5,000 chars with live character counter), **Activity** (activityName + activity text).
- Prev/next day arrows; "Mark day complete" button storing completed days in localStorage (`faith-empire-devotional-completed`, array of day numbers) with checkmark states; a calendar/day-grid picker (weeks of 7) to jump to any day, completed days show a check, locked days show a lock.
- Initial day on load = next uncompleted day (capped at day 7 for free users).
- **Gating: days 1–7 free. Day 8+ requires premium.** Locked view shows "You're on day X of your 7 free days", an unlock CTA opening the paywall, and a "Go back to Day 7" button. Next button label becomes "Unlock Day N" when at the free boundary.

### 2.3 Bible `/bible` (KJV reader)
- Views: **books list** (66 books grouped Old/New Testament, showing chapter counts; non-premium: every book except Genesis shows a lock and opens paywall; Genesis shows a "FREE" tag) → **chapters grid** → **reading view**.
- Chapter text from `GET /api/bible/:book/:chapter` → `{reference, verses: [{verse, text}]}`. Client caches chapters in localStorage under `faith-empire-bible-<book>-<chapter>` as `{data, timestamp}` with 7-day expiry.
- Reading view: chapter title, verse-by-verse text; tap a verse to **highlight** it (stored in localStorage `faith-empire-highlights` as an array of `{id, book, chapter, verse, text, savedAt}`); highlighted verses shown with gold background tint.
- Font size control: small/medium/large stored in `faith-empire-font-size` (values exactly `"small" | "medium" | "large"`, default medium).
- Prev/next chapter navigation (crosses book boundaries; blocked by paywall if next book is premium-locked for free users).
- **Text-to-speech**: browser SpeechSynthesis reads the chapter verse-by-verse with play/pause/stop controls and highlighted "now reading" verse; optional **continuous play** toggle (localStorage `faith_empire_continuous_play` = "true"/"false") auto-advances to the next chapter when one finishes.
- Reading progress: chapters marked read in localStorage `faith-empire-reading-progress` = `{ [bookSlug]: number[] }`.
- **Gating: Genesis fully free; all other books premium** (applies to book list, chapter navigation, and search results — tapping a locked search result opens the paywall).

### 2.4 Decoded `/decoded` (DMLV — Decoded Modern Language Version)
- Fetches `GET /api/decoded/books` → array of `{bookName, slug, totalChapters, totalVerses, description}` (66 books).
- Books organized into 4 series with header cards showing stats ("X books · Y verses"):
  1. The Law (Genesis–Deuteronomy)
  2. History (Joshua–Esther)
  3. Wisdom, Poetry & Prophets (Job–Malachi)
  4. The New Testament (Matthew–Revelation)
- Tapping a book → `/decoded/:bookSlug`.
- **Gating: Genesis free, all other books locked** (lock icon, opens paywall).

### 2.5 Decoded book `/decoded/:bookSlug`
- `GET /api/decoded/:bookSlug` → book meta `{title, author, description, copyright, totalChapters, chapters:[{number,title}]}`; chapter view via `GET /api/decoded/:bookSlug/:chapter` → `{number, title, verses:[{verse, kjv, decoded}]}`.
- Chapter list → reading view showing each verse as a pair: KJV text (serif, muted) above the decoded modern text (bright). Chapter title header, back button, prev/next chapter, font size control, text-to-speech of the decoded text with speech controls, chapter read progress, verse highlighting/favorites same storage as Bible.

### 2.6 Prayers `/prayers` ("Daily Prayers")
- `GET /api/prayers` → array of `{id, title, text, section}` (aggregated from DB + 9 themed collections).
- **Daily rotation**: from the sorted prayer list, a deterministic Morning Prayer and Evening Prayer are picked from today's day-of-year (`morningIdx = dayOfYear % length`, `eveningIdx = (dayOfYear*2 + 1) % length`) — these 2 are FREE today and shown at top as "Morning Prayer" / "Evening Prayer" cards.
- Below: collapsible themed sections in this exact order, then any others:
  1. Prayers of Protection
  2. Prayers Against Mental Warfare
  3. Prayers for Purpose and Destiny
  4. Prayers for Family and Relationships
  5. Prayers for Finances and Provision
  6. Prayers for Health and Healing
  (plus remaining sections from data: New Beginnings, Strength, Depression & Anxiety, etc.)
- **Gating: only the 2 daily rotation prayers are free; every other prayer is premium** (locked cards open paywall).
- **Prayer reminder**: bell icon opens a modal with an hour/minute/AM-PM picker (gold on black styling); saves `{enabled, hour, minute}` to localStorage `faith-empire-prayer-reminder`; requests Notification permission; schedules a daily local notification titled "Time to Pray" / body "Your daily prayer is waiting. Take a moment to connect with God." (tag `prayer-reminder`, via service worker where available). Bell shows a gold dot when enabled; toasts confirm on/off.

### 2.7 Podcast `/podcast`
- `GET /api/podcast/episodes` → `[{title, description, audioUrl, pubDate, duration, image}]` from the Anchor RSS feed.
- Episode cards with artwork, title, date, duration; tapping plays in the **global audio player** — a persistent mini-player bar (above the tab bar) with play/pause, seek, skip ±15s, episode art/title, expandable; keeps playing across navigation.
- **Gating: ALL episodes premium (`FREE_PODCAST_EPISODES = 0`)** — free users see locked episodes that open the paywall.

### 2.8 Favorites `/favorites` — ENTIRE PAGE PREMIUM
Two tabs/sections: saved daily verses (from `faith-empire-favorites`) and Bible highlights (from `faith-empire-highlights`). Cards with remove buttons (animated removal + toast "Verse Removed"), share action, empty states with CTAs.

### 2.9 Archive `/archive` — ENTIRE PAGE PREMIUM
- `GET /api/verses/archive` → all daily verses. Category filter chips ("All" + categories from data). Expandable cards (chevron) showing verse + decoded message, favorite/share actions.

### 2.10 Paywall `/premium` + PaywallModal
- Full-screen dark gold-luxury sales page: logo, "Faith Empire Premium", today's verse preview (blurred/teaser), feature list (365 devotional, full KJV, all 66 decoded books, podcast, prayers, favorites/archive), price **$8.88/month**, primary gold CTA "Subscribe" (Crown icon; shows "Processing…" spinner state), "Restore Purchases" link, links to /terms and /privacy, Apple auto-renew disclosure text.
- Subscribe/Restore call the native bridge (doc 05). If NOT in the WebView (plain browser), Subscribe links to `https://apps.apple.com/app/id6759208291`.
- **Hidden owner unlock**: tapping the logo 7 times shows a PIN modal; entering `8888` sets localStorage `faith_empire_owner_access = "true"` and reloads with full access. Cancel button dismisses.
- **PaywallModal** context: any locked feature calls `usePaywall()`/`useRequirePremium(message)` to open a bottom-sheet modal version of the paywall with the contextual message; also fully dismissible.
- If already premium, `/premium` shows a "You're Premium" confirmation state.

### 2.11 About `/about` ("More")
Mission statement, developer credit (Brittany Johnson), links: Privacy Policy, Terms of Use, manage subscription (`https://apps.apple.com/account/subscriptions`), newsletter email signup (POST `/api/subscribe` with `{email}`, success/already-subscribed toasts), social/website links, app version. Animated cards (framer-motion fade/slide in).

### 2.12 Privacy `/privacy` & Terms `/terms`
Static legal pages, back arrow to `/about`, "Last updated: February 25, 2026", card sections. Content covers: localStorage-only personal data, no accounts, Apple IAP billing, subscription terms ($8.88/month auto-renew), contact info.

---

## 3. Subscription logic (exact)

Provider state: `{isPremium, isLoading, subscribe(), restorePurchases()}`.
- Product ID: `com.decodedfaithempire.app.premium.monthly` — $8.88/month via Apple IAP.
- On load, premium is true if ANY of: owner bypass, preview token, cached `faith_empire_premium === "true"`; then if inside WebView, send `CHECK_SUBSCRIPTION` and update from the native reply (doc 05).
- **Owner bypass**: URL `?dfe_owner=brittany8888` → sets `faith_empire_owner_access="true"`, strips the param from the URL (history.replaceState), permanent premium.
- **Preview token**: URL `?preview=mutimanwa-preview-2026` valid until 2036-03-08 → stores `{token, expiry}` JSON in `faith_empire_preview`, strips param, premium while unexpired.
- Free limits summary: Devotional days 1–7 · Bible & Decoded: Genesis only · Prayers: today's 2 rotation prayers · Podcast: none · Favorites/Archive/paywall-gated pages: none.

## 4. localStorage keys (MUST match exactly)
| Key | Value |
|---|---|
| `faith_empire_premium` | "true"/"false" cached subscription status |
| `faith_empire_owner_access` | "true" owner bypass |
| `faith_empire_preview` | JSON `{token, expiry}` |
| `faith-empire-favorites` | JSON array of Verse objects (newest first) |
| `faith-empire-highlights` | JSON array `{id, book, chapter, verse, text, savedAt}` |
| `faith-empire-font-size` | "small"/"medium"/"large" |
| `faith-empire-reading-progress` | JSON `{[bookSlug]: number[]}` |
| `faith-empire-bible-<Book>-<chapter>` | JSON `{data:{reference,verses},timestamp}`, 7-day TTL |
| `faith_empire_continuous_play` | "true"/"false" |
| `faith-empire-prayer-reminder` | JSON `{enabled, hour, minute}` |
| `faith-empire-journal-<day>` | journal text per devotional day |
| `faith-empire-devotional-completed` | JSON array of completed day numbers |

## 5. PWA / service worker
- `manifest.json`: name "Decoded Faith Empire", black background, gold theme color, icons 192/512, standalone display.
- Service worker: versioned caches (static cache-first with network update; `/api/` network-first with cache fallback for offline); skipWaiting/clients.claim on activate; used for prayer-reminder notifications.
- `index.html` head: OG tags (title/description/url `https://decodedfaithempire.org`, og:image `/icon-512.png`), Twitter card, `<meta name="apple-itunes-app" content="app-id=6759208291">`, Google Fonts: Inter, Outfit, Cormorant Garamond.

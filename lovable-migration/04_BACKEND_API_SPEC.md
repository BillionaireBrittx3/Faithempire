# 04 — BACKEND API & DATA SPEC

On Lovable, implement these as Supabase Edge Functions (or the equivalent backend) but the **client-facing paths and JSON shapes must remain exactly as below**, because the app's caching, service worker, and pages depend on them.

## Database tables (currently PostgreSQL; recreate in Supabase)

### `verses` (100 rows — export provided in `data/verses-export.json`)
| Column | Type | Notes |
|---|---|---|
| id | serial PK | |
| verse_number | integer NOT NULL UNIQUE | 1..N, used for daily rotation |
| reference | text NOT NULL | e.g. "Hebrews 11:1" |
| verse_text | text NOT NULL | KJV text |
| decoded_message | text NOT NULL | modern-language message |
| category | text NOT NULL | e.g. Faith, Strength… (drives Archive filters) |
| book | text NOT NULL | |
| prayer_title | text NULL | some rows double as prayers |
| prayer_text | text NULL | |
| prayer_section | text NULL | |

### `subscribers` (export provided in `data/subscribers-export.json`)
| Column | Type |
|---|---|
| id | serial PK |
| email | text NOT NULL UNIQUE |
| first_name | text NULL |
| subscribed_at | timestamp DEFAULT now() |
| active | boolean DEFAULT true |
| source | text DEFAULT 'app' |

API responses use camelCase (`verseNumber`, `verseText`, `decodedMessage`, `prayerTitle`, …).

## API endpoints (exact paths & shapes)

### Bible (proxy of bible-api.com, KJV)
- `GET /api/bible/:book/:chapter` → fetch `https://bible-api.com/<book>+<chapter>?translation=kjv`, return `{ reference: string, verses: [{ verse: number, text: string }] }`.
- `GET /api/bible/search?q=...` → verse search (bible-api.com), returns matches `[{ book, chapter, verse, text, reference }]`.

### Decoded books (static JSON, files provided in `data/decoded/`)
- `GET /api/decoded/books` → contents of `books-index.json`: `[{ bookName, slug, totalChapters, totalVerses, description }]` (66 books).
- `GET /api/decoded/:bookSlug` → book meta from `<slug>-decoded.json`: `{ title, author, description, copyright, totalChapters, chapters: [{ number, title }] }` (without verse bodies).
- `GET /api/decoded/:bookSlug/:chapter` → `{ number, title, verses: [{ verse, kjv, decoded }] }`.
- File naming: `<slug>-decoded.json`, slugs like `genesis`, `1-corinthians`, `song-of-solomon`.

### Verses
- `GET /api/verses/today` → one verse selected by day-of-year: `verseNumber = ((dayOfYear - 1) % totalVerses) + 1` (new verse at midnight Eastern Time). Returns a full verse object.
- `GET /api/verses/archive` → all verses ordered by verseNumber.
- `GET /api/verses/:id` → verse by verse_number.

### Prayers
- `GET /api/prayers` → aggregated array `[{ id, title, text, section }]` combining:
  - DB verses rows where prayerTitle/prayerText/prayerSection are set, and
  - 9 static themed collections (files provided in `data/prayers/`): healing, strength, family, depression & anxiety, new beginnings, plus the `wg*` collections (protection, mental warfare, purpose/destiny, finances/provision). Each file exports `{ title, text, section }` entries; assign stable sequential ids.

### Subscribers (newsletter)
- `POST /api/subscribe` body `{ email, firstName? }` → upsert into subscribers (reactivate if inactive); 200 with success message; validate email (zod).
- `POST /api/unsubscribe` body `{ email }` → set active=false.
- `GET /api/subscribers/export?key=<ADMIN_EXPORT_KEY>` → CSV download of subscribers; 401 unless key matches env secret.

### Podcast
- `GET /api/podcast/episodes` → fetch & parse RSS `https://anchor.fm/s/10ee7543c/podcast/rss`; return `[{ title, description, audioUrl, pubDate, duration, image }]`. Cache server-side ~15 min to be gentle to the feed.

### iOS deep-linking
- `GET /.well-known/apple-app-site-association` → JSON (served with content-type application/json, no extension):
  `{"applinks":{"apps":[],"details":[{"appID":"<TEAM_ID>.com.decodedfaithempire.faithempire","paths":["*"]}]}}`

## Environment variables / secrets
| Name | Purpose |
|---|---|
| `ADMIN_EXPORT_KEY` | protects the subscriber CSV export |
| (Supabase URL/keys) | Lovable manages these automatically |

No server sessions, no user accounts, no login. The server is stateless; all per-user data lives in device localStorage.

## External services summary
- `bible-api.com` (free, no key) — KJV text + search.
- Anchor/Spotify RSS feed — podcast episodes.
- Apple App Store — subscription billing, entirely via the native wrapper (doc 05). The web backend does NOT process payments.

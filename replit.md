# Faith Empire - Daily Bible Verse & Decoded Message App

## Overview
Faith Empire is a mobile-first Progressive Web App (PWA) for decodedfaithempire.org that delivers a fresh Bible verse and plain-language motivational message every day. Built with React + Express + PostgreSQL.

## Recent Changes
- 2026-02-13: Added "The Book of Genesis Decoded" reader with 50 chapters, 1,533 verses. Each verse shows KJV text, modern decoded translation, and optional context. Tap-to-highlight with localStorage. Accessible via More page Quick Links.
- 2026-02-13: Added KJV Bible reader with 66 books, chapter navigation, tap-to-highlight verses (localStorage). Reorganized tabs: Today, Bible, Podcast, Saved, More. Archive moved to More page. Saved page now has Favorites + Highlights tabs.
- 2026-02-10: Initial MVP built with 100 seeded verses, 4 pages (Today, Archive, Favorites, About), bottom tab navigation, dark/light mode, email subscription

## Architecture
- **Frontend**: React (Vite) with Tailwind CSS, Shadcn UI components, Framer Motion animations
- **Backend**: Express.js with REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Fonts**: Playfair Display (headings), Inter (body), Lora (verse text), DM Sans (decoded messages)
- **Colors**: Black background (#000000), Gold accent (#DFAC2A / HSL 43 88% 51%)

## Key Pages
- `/` - Today's verse (home)
- `/bible` - KJV Bible reader (66 books, chapter navigation, tap-to-highlight)
- `/archive` - Browse all decoded verses with category filtering (accessible from More page)
- `/favorites` - Saved verses + Bible highlights (two tabs, localStorage)
- `/podcast` - Podcast episodes with in-app audio player
- `/decoded` - Decoded Books landing page (lists all available decoded books)
- `/decoded/genesis` - The Book of Genesis Decoded reader (50 chapters, KJV + modern translation + context)
- `/about` - Brand info, subscribe, social links, settings, privacy, quick links

## Navigation (Bottom Tab Bar)
- Today, Bible, Podcast, Decoded, More
- Saved Verses & Highlights accessible from More page Quick Links

## API Endpoints
- `GET /api/verses/today` - Returns today's verse (rotates by day of year)
- `GET /api/verses/archive` - Returns all verses
- `GET /api/verses/:id` - Returns verse by number
- `GET /api/bible/:book/:chapter` - Proxies KJV Bible text from bible-api.com
- `GET /api/decoded/genesis` - Returns decoded book summary (chapters list with titles, verse counts)
- `GET /api/decoded/genesis/:chapter` - Returns chapter data with verses (kjv, decoded, context)
- `POST /api/subscribe` - Email subscription

## Database Tables
- `verses` - id, verse_number, reference, verse_text, decoded_message, category, book
- `subscribers` - id, email, first_name, subscribed_at, active, source

## User Preferences
- Dark mode by default (matches brand), toggleable in About page
- Favorites stored in localStorage (no account required)
- Mobile-first design with bottom tab navigation

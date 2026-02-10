# Faith Empire - Daily Bible Verse & Decoded Message App

## Overview
Faith Empire is a mobile-first Progressive Web App (PWA) for decodedfaithempire.org that delivers a fresh Bible verse and plain-language motivational message every day. Built with React + Express + PostgreSQL.

## Recent Changes
- 2026-02-10: Initial MVP built with 100 seeded verses, 4 pages (Today, Archive, Favorites, About), bottom tab navigation, dark/light mode, email subscription

## Architecture
- **Frontend**: React (Vite) with Tailwind CSS, Shadcn UI components, Framer Motion animations
- **Backend**: Express.js with REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Fonts**: Playfair Display (headings), Inter (body), Lora (verse text), DM Sans (decoded messages)
- **Colors**: Black background (#000000), Gold accent (#DFAC2A / HSL 43 88% 51%)

## Key Pages
- `/` - Today's verse (home)
- `/archive` - Browse all verses with category filtering
- `/favorites` - Saved verses (localStorage)
- `/about` - Brand info, subscribe, social links, settings, privacy

## API Endpoints
- `GET /api/verses/today` - Returns today's verse (rotates by day of year)
- `GET /api/verses/archive` - Returns all verses
- `GET /api/verses/:id` - Returns verse by number
- `POST /api/subscribe` - Email subscription

## Database Tables
- `verses` - id, verse_number, reference, verse_text, decoded_message, category, book
- `subscribers` - id, email, first_name, subscribed_at, active, source

## User Preferences
- Dark mode by default (matches brand), toggleable in About page
- Favorites stored in localStorage (no account required)
- Mobile-first design with bottom tab navigation

# Faith Empire - App Review Guide

**Prepared for Apple App Store Review Team**
**Date: February 14, 2026**

---

## App Overview

**App Name:** Faith Empire
**Developer:** Brittany Johnson / Decoded Faith Empire
**Website:** https://decodedfaithempire.org
**Version:** 1.0.0
**Category:** Books / Lifestyle
**Age Rating:** 4+

Faith Empire is a mobile-first Progressive Web App (PWA) wrapped in a native iOS shell that delivers a fresh Bible verse paired with a plain-language "decoded" motivational message every day at midnight Eastern Time. The app is designed to make the Bible accessible and relatable to modern readers.

---

## How the App Works

Faith Empire loads a web-based application inside a native WebView. The web app is hosted at https://faithempire.replit.app and provides the complete user experience. No account or login is required to use the app.

---

## Core Features

### 1. Daily Decoded Verse (Home Screen)
- A new Bible verse and decoded message appear every day at midnight ET
- Users can share verses via the built-in share button
- Users can save verses to their favorites for later reference

### 2. Full KJV Bible Reader
- Complete King James Version Bible with all 66 books
- Organized by Old Testament and New Testament
- Chapter-by-chapter navigation
- Tap any verse to highlight it (highlights saved locally on device)

### 3. The Book of Genesis Decoded
- All 50 chapters of Genesis with 1,533 verses
- Each verse shows three layers: original KJV text, modern decoded translation, and optional context notes
- Tap-to-highlight functionality with local storage

### 4. Podcast
- In-app audio player for faith-based podcast episodes
- Play, pause, and browse episodes directly within the app

### 5. Verse Archive
- Browse the full collection of decoded verses
- Filter by category (encouragement, wisdom, strength, peace, etc.)

### 6. Saved Content
- Favorites: Saved daily decoded verses
- Highlights: Highlighted Bible and Genesis verses
- All stored locally on device using localStorage (no account needed)

---

## Navigation Structure

The app uses a bottom tab bar with five tabs:

| Tab | Description |
|-----|-------------|
| Today | Daily decoded verse (home screen) |
| Bible | Full KJV Bible reader |
| Podcast | Podcast episodes with audio player |
| Decoded | Decoded books (Genesis) |
| More | Settings, archive, saved content, about, legal pages |

---

## Technical Details

- **Architecture:** React frontend + Express.js backend + PostgreSQL database
- **iOS Wrapper:** Expo with React Native WebView
- **Content Delivery:** 100 pre-seeded decoded verses that rotate daily
- **Data Storage:** Favorites and highlights stored in device localStorage
- **Network Required:** Yes, for initial load and daily verse refresh
- **Authentication:** None required

---

## Content Details

- All Bible text is from the King James Version (public domain)
- Decoded messages and modern translations are original content by Brittany Johnson
- Copyright 2025 Brittany Johnson
- Book content: "The Book of Genesis Decoded" by Brittany Johnson

---

## Privacy & Data

- **No user accounts or login required**
- **No personal data collected** beyond optional email subscription
- **No third-party analytics or tracking**
- Favorites and highlights stored locally on the user's device
- Optional email subscription for updates (voluntary, not required for app use)
- Privacy Policy: https://faithempire.replit.app/privacy
- Terms of Service: https://faithempire.replit.app/terms

---

## Testing Instructions

1. **Open the app** - It should load to the "Today" tab showing the daily verse
2. **Tap the heart icon** on the daily verse to save it to favorites
3. **Tap "Bible"** tab - Browse books, select a book, read chapters, tap verses to highlight
4. **Tap "Podcast"** tab - Browse and play podcast episodes
5. **Tap "Decoded"** tab - Open Genesis Decoded, browse chapters, read decoded verses
6. **Tap "More"** tab - Access saved content, archive, settings (dark/light mode toggle), about page, and legal pages

**Demo Credentials:** None required. The app is fully functional without any login.

---

## URLs for Reference

- **Live Web App:** https://faithempire.replit.app
- **Privacy Policy:** https://faithempire.replit.app/privacy
- **Terms of Service:** https://faithempire.replit.app/terms
- **Support/Marketing:** https://decodedfaithempire.org

---

## Contact

**Developer:** Brittany Johnson
**Email:** brittanyj0819@icloud.com
**Website:** https://decodedfaithempire.org

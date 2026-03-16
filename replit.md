# Faith Empire - Daily Bible Verse & Decoded Message App

## Overview
Faith Empire is a mobile-first Progressive Web App (PWA) that delivers a daily Bible verse and an accompanying plain-language motivational message. It is built to serve as a comprehensive spiritual resource, offering a KJV Bible reader, decoded biblical texts, a prayer book, and a podcast. The project aims to provide an accessible and engaging platform for daily spiritual nourishment, with a vision to become a leading digital resource for faith-based content. The application supports a subscription model to unlock premium content, ensuring sustainability and continuous development.

## User Preferences
- Dark mode by default (matches brand), toggleable in About page
- Font size (small/medium/large) stored in localStorage, applies to Bible reader and decoded books
- Favorites stored in localStorage (no account required)
- Reading progress for decoded books stored in localStorage
- Bible chapter cache (7-day expiry) in localStorage
- New verse notification badge state in localStorage
- Mobile-first design with bottom tab navigation
- Owner bypass: 7 taps on logo → PIN "8888" or `?dfe_owner=brittany8888` (intentional dev tool, not to be removed)

## System Architecture
The application is structured as a PWA with a React (Vite) frontend, an Express.js backend, and a PostgreSQL database utilizing Drizzle ORM.
- **Frontend**:
    - Built with React (Vite), styled with Tailwind CSS, and uses Shadcn UI components for a consistent design system. Framer Motion is used for animations.
    - Key UI/UX elements include a mobile-first design with a bottom tab navigation bar (Today, Bible, Podcast, Decoded, More).
    - Color scheme: Black background (`#000000`) with a Gold accent (`#DFAC2A`).
    - Typography uses Playfair Display for headings, Inter for body text, Lora for verse text, and DM Sans for decoded messages.
    - Features include:
        - Daily verse display.
        - KJV Bible reader with chapter navigation, tap-to-highlight verses, search, and font size control.
        - A prayer book with 100 prayers organized into 10 sections.
        - Podcast player with persistent global audio context.
        - Decoded Books section presenting all 66 books of the Bible with KJV and Decoded Modern Language Version (DMLV) texts, reading progress tracking, and continuous play for audio.
        - Listen Along (text-to-speech) feature using the browser SpeechSynthesis API, with playback controls and voice selection.
        - User preferences for dark mode, font size, and content saving (favorites, reading progress) are stored locally.
- **Backend**:
    - Express.js powers a REST API to serve content.
    - Data for decoded books is stored as JSON files on the server and cached in memory.
    - Server operates in production mode, serving pre-built static files to ensure stability.
- **Database**:
    - PostgreSQL is used for data storage, managed with the Drizzle ORM.
    - Tables include `verses` (for daily verses, prayers, and decoded messages) and `subscribers` (for user subscription data).
- **Core Features**:
    - **Subscription System**: Content is gated behind an $8.88/month Apple IAP subscription. A custom StoreKit module handles in-app purchases and restoration.
    - **Decoded Books System**: Provides parsed KJV and DMLV texts for all 66 books, stored as JSON, with features like context annotations and series organization.
    - **Prayer Book**: Integrates 100 prayers paired with daily verses.
    - **Build Process**: Employs `npm run build` before `npm run start` to ensure the server always serves pre-built static files. A `SIGHUP` handler is implemented for server stability.
    - **iOS Widget (Planned)**: A Daily Prayer Widget is developed (Swift-based) but currently disabled in builds due to Expo SDK limitations. It will fetch and display today's prayer.

## External Dependencies
- **Apple In-App Purchases (IAP)**: For managing premium subscriptions.
- **PostgreSQL**: Relational database for storing application data.
- **Drizzle ORM**: Object-Relational Mapper for interacting with PostgreSQL.
- **Vite**: Frontend build tool.
- **Tailwind CSS**: Utility-first CSS framework.
- **Shadcn UI**: UI component library.
- **Framer Motion**: Animation library for React.
- **bible-api.com**: Used as a proxy for KJV Bible text.
- **Browser SpeechSynthesis API**: For text-to-speech functionality.
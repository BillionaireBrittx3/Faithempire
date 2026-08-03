# 03 — DESIGN SYSTEM (exact values)

Overall feel: **premium black + gold devotional aesthetic.** Dark mode is the primary/default theme. Feels native-app quality inside the iOS wrapper.

## Colors (dark mode — the shipping look)
| Token | Value |
|---|---|
| Primary / gold | `#DFAC2A` (HSL `43 88% 51%`) — buttons, active tabs, accents, highlights |
| Primary foreground | near-white `hsl(43 10% 98%)` (dark text `#000` used on solid gold buttons) |
| Background | `#000000` pure black |
| Foreground (text) | `#F2F2F2` off-white |
| Card | `#0F0F0F`–`#111111` |
| Card border | `#1A1A1A` (gold-tinted borders use `#DFAC2A` at 20–30% opacity, e.g. `border-[#DFAC2A]/20`) |
| Muted text | white at 40–60% opacity (`text-white/40`, `text-white/50`) |
| Destructive | deep red `hsl(0 84% 35%)` |
| Ring/focus | gold `43 88% 51%` |

Light mode exists as CSS variables (white bg, near-black text, same gold primary) but the app defaults to dark and is designed for dark.

## Typography (Google Fonts)
| Role | Font stack |
|---|---|
| Sans (body/UI) | `Inter, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif` |
| Serif (scripture, headings, editorial) | `"Cormorant Garamond", "Iowan Old Style", Georgia, "Times New Roman", serif` |
| Display | `Outfit, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif` |
| Mono | `Menlo, monospace` |

Usage rules:
- Page H1s: `font-serif text-2xl font-bold` (Cormorant Garamond) — reads premium/devotional.
- Scripture/verse text: serif, slightly larger, often italic for quotes.
- Decoded/modern text and UI: Inter.
- Editorial labels (`.label-editorial`): Cormorant Garamond, weight 600, no letter-spacing, no uppercase transform.

## Layout & spacing
- Base spacing unit `0.25rem`; border radius `--radius: 0.5rem` (cards often `rounded-2xl` for modals).
- Content column: `max-w-lg` (512px) centered; page padding `px-4`, headers `pt-5 pb-3`; all pages `pb-20` for tab bar clearance.
- Tap targets minimum 44×44px (tab bar buttons enforce `min-h-[44px] min-w-[44px]`).
- Shadows essentially flat (near-zero) — depth comes from borders and background contrast, not shadows.
- Focus: no outline on mouse focus (`:focus:not(:focus-visible) { outline: none }`), visible ring for keyboard focus.

## Components & motion
- shadcn/ui-style components (Button, Card, Input, Skeleton, Toast, Dialog, etc.).
- framer-motion for: page section fade/slide-in (`initial={{opacity:0,y:10}}`, ~0.4s), modal scale-in (`scale: 0.9→1`), AnimatePresence on list removals, header search overlay.
- Loading states: Skeleton blocks matching card layouts; spinners are gold border-top on rotating rounded-full divs.
- Toasts for confirmations (favorite added/removed, reminder on/off, subscribed).
- Locked content pattern: Lock icon (lucide), reduced opacity, gold "Premium" tag; free items may show a gold "FREE" chip.
- Buttons: solid gold (`bg-[#DFAC2A]` with black text) for primary CTAs; ghost/outline white-muted for secondary.
- Icons: lucide-react throughout (BookOpen, Book, CalendarDays, HandHeart, Menu, Crown, Lock, Sparkles, Bell, ChevronLeft/Right/Up/Down, Check, CheckCircle2, Headphones, Play, Search, X).

## Brand assets
- Logo: gold "Decoded Faith Empire" emblem PNG on transparent/black (export it from the current site or GitHub repo: `attached_assets/Copy_of_EPRODUCTS_EMPIRE_PODCAST_(98)_1770693543975.png`).
- App icons: 192×192 and 512×512 (`/icon-192.png`, `/icon-512.png`).
- data-testid attributes on interactive elements (pattern: `button-*`, `text-*`, `input-*`, `tab-*`) — keep this convention.

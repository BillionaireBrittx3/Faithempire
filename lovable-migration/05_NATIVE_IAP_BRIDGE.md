# 05 — NATIVE WEBVIEW ↔ WEB SUBSCRIPTION BRIDGE (CRITICAL)

The App Store app (iOS App ID **6759208291**, bundle `com.decodedfaithempire.faithempire`) is a React Native (Expo) wrapper that loads the website in a WebView from a fixed URL (currently `https://faithempire.replit.app`). The wrapper handles Apple In-App Purchases natively and talks to the web app through `postMessage`. **The rebuilt web app must implement this protocol byte-for-byte or subscriptions in the App Store app will break.**

## Product
- Product ID: `com.decodedfaithempire.app.premium.monthly`
- Price: $8.88/month, auto-renewing subscription ("Faith Empire Premium").

## Detecting the wrapper
The web app is "inside the app" when `window.ReactNativeWebView` is defined.

## Messages WEB → NATIVE
Sent via `window.ReactNativeWebView.postMessage(JSON.stringify(msg))`:
| Message | When |
|---|---|
| `{ "type": "CHECK_SUBSCRIPTION" }` | on app load (SubscriptionProvider mount) |
| `{ "type": "PURCHASE", "productId": "com.decodedfaithempire.app.premium.monthly" }` | user taps Subscribe |
| `{ "type": "RESTORE_PURCHASES" }` | user taps Restore Purchases |

## Messages NATIVE → WEB
The wrapper injects `window.postMessage(<json string>, '*')`, so the web app must listen on `window.addEventListener("message", ...)` and accept `event.data` as either a JSON string or an object:
| Message | Web app behavior |
|---|---|
| `{ "type": "SUBSCRIPTION_STATUS", "isPremium": boolean }` | set premium state, cache to localStorage `faith_empire_premium`, clear loading |
| `{ "type": "PURCHASE_COMPLETE", "isPremium": true }` | set premium true, cache, clear loading |
| `{ "type": "PURCHASE_FAILED", "reason": string }` | clear loading state (reasons seen: "error", "not_supported") |
| `{ "type": "RESTORE_COMPLETE", "isPremium": boolean }` | set premium accordingly, cache, clear loading |

Unparseable messages must be silently ignored (other scripts also post messages).

## Behavior outside the wrapper (plain web browser)
- No web checkout. The Subscribe button links to `https://apps.apple.com/app/id6759208291`.
- "Manage subscription" links to `https://apps.apple.com/account/subscriptions` (Android fallback: `https://play.google.com/store/account/subscriptions`).

## Access overrides (must be preserved exactly)
1. **Owner URL bypass**: visiting any page with `?dfe_owner=brittany8888` → `localStorage.faith_empire_owner_access = "true"`, strip the query param via `history.replaceState`, premium forever on that device.
2. **Owner PIN**: on the paywall page, tap the logo 7 times → PIN prompt → `8888` sets the same owner key and reloads.
3. **Preview token**: `?preview=mutimanwa-preview-2026` (valid until 2036-03-08) → stores `{token, expiry}` in `localStorage.faith_empire_preview`, premium while unexpired.

## Why the App Store app is safe during migration
The wrapper's URL is hardcoded to the current site. Building on Lovable changes nothing for App Store users. Only when you ship a new wrapper build (via EAS/App Store Connect) with `APP_URL` pointed at the new domain does the App Store app switch over — and it must not be switched until the new site passes the checklist in 06_MIGRATION_STEPS.md, especially this bridge, App Review compliance (no external payment links inside the WebView), and the `apple-app-site-association` file.

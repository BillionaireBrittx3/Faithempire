---
name: Lovable migration state
description: Where the app now lives and how the iOS wrapper, GitHub repo, and Lovable rebuild relate.
---

- The app was rebuilt on lovable.dev; the live rebuild is at https://decodedfaithbiblestudy.lovable.app (user chose to keep the lovable.app domain, not a custom domain).
- The iOS wrapper (`faith-empire-app/`, App Store ID 6759208291) and its widget now point at the Lovable URL; shipping requires an EAS build + App Store Connect submit done by the user off-Replit.
- GitHub repo BillionaireBrittx3/Faithempire: `main` is an UNRELATED history holding the iOS wrapper at repo root (webapp/ subfolder); this Replit project is pushed to branch `replit-main`. Never force-push over `main` — it may feed App Store builds.
- **Why:** histories are unrelated; overwriting `main` could break the EAS/App Store pipeline.
- Known pre-existing issue (not a regression): apple-app-site-association contains placeholder `TEAM_ID.com.decodedfaithempire.faithempire`, and app.json bundle ID is `com.decodedfaithempire` (no `.faithempire`) with no associatedDomains — Universal Links never worked. Fix requires the user's Apple Team ID and lives on the Lovable-served site now.
- Full migration package with specs + all data exports is in `lovable-migration/` (also on the GitHub branch).

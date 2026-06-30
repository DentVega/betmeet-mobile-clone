# Bolt 10 — Design Parity — Outcome

- **Status:** ✅ Complete (verified on device incl. a native rebuild)
- **Type:** post-v1 visual parity with betmeet-clone's design system.

## What shipped
- **Theme** (`src/theme/`): betmeet-clone "deportivo" tokens (light+dark, hex) + `useTheme()` (light/dark by device scheme) + radius/spacing/typography.
- **Primitives** (`src/ui/`): themed `Screen`, `Button`, `TextField` (+ show/hide); new `Card`, `Badge`, `Txt`, `Flag` (SVG), `Avatar` (local-SVG/URL/fallback).
- **All screens restyled** to the theme: Auth (5), Onboarding (3), Matches + MatchCard + PredictionForm, Pools (5), Leaderboard (Rankings + PoolLeaderboard + RankRow), AppTabs tab bar + headers, SignOutButton. No hardcoded blues/greys left.
- **Assets**: `src/assets/flags.ts` (14 team flag SVGs ported from web `public/flags`, keyed by ISO; ng/cr missing → code fallback) via `react-native-svg`; `src/assets/avatars.ts` (6 default avatar SVGs from web `public/avatars`) — no Storage bucket needed for defaults.

## Native dependency
`react-native-svg@15` added (flags + avatars). Required a native rebuild — done (`npm run android`, BUILD SUCCESSFUL 58s) and verified: Matches shows flags + deportivo green.

## Verified
tsc clean; jest 51/51; Rspack bundle green (~5.5 MB w/ inlined SVGs); on-device screenshots confirm deportivo theme on Auth + Matches + tabs and flags rendering per match.

## Fonts (done — follow-up completed)
Embedded **Barlow Semi Condensed** (display/headings) + **Geist** (sans/body): static TTFs in `assets/fonts/` (Geist Regular/Medium/SemiBold/Bold from vercel/geist-font; Barlow SemiBold/Bold/ExtraBold from google/fonts), linked via `react-native-asset` (`react-native.config.js` assets), exposed in `theme/tokens.ts` `fonts`, and applied in Txt/Button/TextField/auth+onboarding titles/AppTabs. Android rebuilt + verified. iOS: react-native-asset added the Info.plist entries; needs `pod install` + iOS build to take effect.

## Carried forward / follow-ups
- **iOS**: needs `pod install` to link react-native-svg before an iOS build.
- Missing flags (Nigeria, Costa Rica) — add SVGs when available.
- The other 2 brand themes (moderno/premium) + a theme switcher — only deportivo ported.
- New-user default avatar: the signup trigger assigns a seed bucket URL (broken); `<Avatar>` falls back gracefully until the user picks a local default in onboarding. Optionally re-point the seed/trigger to `local-N` keys.

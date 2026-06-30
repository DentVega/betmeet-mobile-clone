# Bolt 10 — Design Parity (post-v1)

> Bring the RN app's visuals in line with betmeet-clone's design system. The web uses Tailwind v4 + semantic tokens (3 brand themes × light/dark) + shadcn/ui + lucide + SVG flags. v1 RN shipped generic styling; this bolt ports the **deportivo** brand (default) light+dark, builds matching primitives, and restyles screens + assets.

## Decision
- Port the **deportivo** token set (hex, verbatim from `globals.css`) → `src/theme/tokens.ts` (light + dark) + `useTheme()` (light/dark by device color scheme). RN has no CSS vars, so tokens are TS objects consumed via the hook.
- Rebuild shared primitives to consume the theme: `Screen`, `Button`, `TextField`, plus new `Card`, `Badge`, `Txt`.
- Fonts (Barlow display / Geist sans) NOT embedded yet — system fallback with matching weights/spacing; embedding is a follow-up.

## Phases
- **Phase 1 ✅** — theme module + primitives + Auth screens (themed via `useAuthStyles`).
- **Phase 2 (in progress)** — restyle feature screens. Done: Matches (MatchCard→Card/Badge/Txt, CTA→primary), MatchesScreen header/toggle, AppTabs tab bar + headers, SignOutButton. Pending: PredictionForm, Pools (5 screens), Leaderboard (RankRow), Onboarding (3 screens).
- **Phase 3 (pending)** — assets: team flags as SVG (`react-native-svg` → native rebuild) keyed by iso_alpha2; default avatars bundled/hosted; logo.

## Verified
tsc clean; jest 51/51; android bundle green; on-device screenshot confirms deportivo green primary on Auth + Matches + tab bar.

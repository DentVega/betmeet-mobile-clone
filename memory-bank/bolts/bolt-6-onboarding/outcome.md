# Bolt 6 — Onboarding — Outcome

- **Status:** ✅ Complete (code; user runs `db push` + `functions deploy set-nickname` to activate the backend bit)
- **Intent:** 001-mobile-v1-migration · Phase C (first mobile feature bolt)
- **DDD:** Model → Design → ADR-012 → Implement → Test (checkpoints approved)
- **Stories:** US-O1…O4

## What shipped
The profile-completion wizard that closes the app-shell gate:
- **Mobile** `src/onboarding/`: 3 real screens (Nickname → Avatar → Rules) replacing the Bolt 0 OnboardingStack placeholders; `data/` (onboardingApi, useAvatarAssets via TanStack Query); reuses `ui/{TextField,Button,Screen}`; `onboarding.*` i18n (es/en).
- **Backend addition**: migration `20260630150000_set_nickname.sql` (`fn_set_nickname` — atomic discriminator, regex, NICKNAME_TAKEN) + `set-nickname` Edge Function (JWT) + config entry.
- **Writes (ADR-012)**: nickname → `functions.invoke('set-nickname')`; avatar + complete → direct RLS own-row `profiles` updates; on complete → `setOnboardingCompleted(true)` flips the gate so `resolveAppPhase` advances Onboarding → App.

## ADRs
ADR-012 — set-nickname function + direct-RLS avatar/complete + gate refresh.

## Verification
- `tsc` clean (excluded `supabase/` Deno funcs from app tsconfig); `jest` 43/43 (fixed a stale profileGate test); Rspack android bundle exit 0.
- `fn_set_nickname` validated on ephemeral PG17 (8 migrations clean): assigns discriminator, bumps change_count, rejects bad regex.

## Tooling notes
- `tsconfig.json` excludes `supabase` (Deno); `jest.config.js` `testPathIgnorePatterns` ignores `/supabase/`.

## Carried forward
- Live wizard E2E (deployed set-nickname + avatar bucket + signed-in user) after deploy.
- Google-photo avatar option not surfaced (default set only) — fine for v1.
- RNTL screen tests deferred (logic at data/fn layer).

## Next
Bolt 7 — Matches & Predictions (mobile): fixture read (RLS) + `save-prediction` function; lock/results/points display.

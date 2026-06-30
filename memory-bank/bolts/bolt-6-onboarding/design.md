# Bolt 6 — Stage 2: Design (Onboarding)

> Implements the Stage-1 model. Backend: one migration + one Edge Function. Mobile: real wizard screens replacing the Bolt 0 OnboardingStack placeholders. Choices → ADR-012.

## Backend
- **Migration `20260630150000_set_nickname.sql`** — `fn_set_nickname(p_base text) returns jsonb` (plpgsql, SECURITY DEFINER, `auth.uid()`):
  - validate `p_base` against `^[A-Za-z0-9_-]{3,20}$` → else `INVALID`;
  - loop ≤10: pick `lpad((random*10000)::int::text,4,'0')`; if no non-deleted profile has the same `lower(nickname_base)` + that discriminator → use it; after 10 → `NICKNAME_TAKEN`;
  - update the caller's profile (`nickname_base`, `nickname_discriminator`, `nickname_updated_at=now()`, `nickname_change_count = nickname_change_count + 1`);
  - return `{ ok:true, nickname: base||'#'||discriminator }`. `grant execute … to authenticated`.
- **Edge Function `set-nickname`** (verify_jwt=true) — wraps `fn_set_nickname`, maps errors (mirrors Bolt 4 pattern). Added to `config.toml [functions]`.

## Mobile structure
```
src/onboarding/
├── data/
│   ├── onboardingApi.ts     # setNickname (functions.invoke 'set-nickname'),
│   │                        # setAvatar (supabase.from('profiles').update),
│   │                        # completeOnboarding (update onboarding_completed=true)
│   ├── useAvatarAssets.ts   # TanStack Query: read avatar_assets (RLS public)
│   └── useProfile.ts        # TanStack Query: caller's profile row
└── screens/
    ├── NicknameScreen.tsx   # base input (zod 3–20) → set-nickname → show base#NNNN → Next
    ├── AvatarScreen.tsx     # FlashList grid of default avatars (+ Google photo if avatar_source) → select → update → Next
    └── RulesScreen.tsx      # rules text + acknowledge → completeOnboarding → advance
```
`app/navigation/OnboardingStack.tsx` swaps placeholders for these. Reuses `ui/{TextField,Button,Screen}`; new `onboarding.*` i18n keys (es/en).

## Data layer
- Reads via `@supabase/supabase-js` (the Bolt 0 client) wrapped in TanStack Query (`avatar_assets`, `profiles`). 
- `set-nickname` via `supabase.functions.invoke('set-nickname', { body:{ base } })` → returns `{ok, nickname}` or `{ok:false, code}`; surfaced via `tr('onboarding.errors.'+code)`.
- Avatar/complete via `supabase.from('profiles').update({...}).eq('id', userId)` (RLS own-row).

## Gate refresh (key wiring)
Completing onboarding is a table UPDATE, not an auth event, so the `onAuthStateChange` gate won't refire. On `completeOnboarding` success → call `useSessionStore.getState().setOnboardingCompleted(true)` → `resolveAppPhase` flips `Onboarding → App` declaratively (no imperative navigation). This is the same store the gate uses, so it's consistent.

## Per-step commit + Back
Each step commits server-side as it completes (nickname assigned, avatar saved), so Back/forward needs no fragile transient state — navigating back just lets the user redo a step (re-running set-nickname during onboarding is allowed, no cooldown). `onboarding_completed` flips only on the final Rules step.

## ADR-012
Onboarding writes split (set-nickname = function for atomic discriminator; avatar/complete = direct RLS own-row) + gate-refresh via the session store. Recorded in `adr-012-onboarding-writes.md`.

## Test surface (Stage 5)
- Backend: apply `fn_set_nickname` on ephemeral PG; assert it assigns a discriminator, rejects bad regex (`INVALID`), and that a forced full-collision path returns `NICKNAME_TAKEN`; uniqueness constraint holds.
- Mobile (RNTL): NicknameScreen validates + calls the api (mocked) and renders the returned `base#NNNN`; AvatarScreen renders the asset grid + selects; RulesScreen complete calls `setOnboardingCompleted`. Pure: zod nickname schema.
- tsc + Rspack bundle green.

# Bolt 6 — Stage 5: Test (Onboarding)

## Static / mobile
- `npx tsc --noEmit` — **clean** after excluding `supabase/` (Deno functions) from the app tsconfig.
- `jest` — **43/43** (fixed a stale `profileGate` test that still used camelCase after the Bolt 2 snake_case rename).
- Jest/tsc now ignore `supabase/` (Deno `*.test.ts` belongs to `deno test`).
- Re.Pack/Rspack android bundle — see result line below.

## Backend — fn_set_nickname on ephemeral PG17
Applied all **8** migrations clean, then exercised:
```
set_nickname valid: ok=true nickname=Cool_Name-1#3787   ← discriminator assigned
profile base/disc = Cool_Name-1 / 3787 count=1          ← profile updated, change_count bumped
too_short ('ab'): OK (INVALID)
bad_chars ('bad name!'): OK (INVALID)
```
Regex + assignment + unique-collision loop validated. (Forced NICKNAME_TAKEN path — all 10k discriminators taken — is infeasible to test offline; the constraint + 10-retry loop is the guard.)

## Bundle build result
- `npx react-native bundle --platform android --dev false` → **exit 0** (Rspack 1.7.12, ~4.7 MB). Onboarding screens + data hooks resolve. 2 benign Supabase OpenTelemetry warnings only.

## Not covered here (needs deploy + device)
- Live wizard E2E (nickname via deployed `set-nickname`, avatar grid from `avatar_assets`, complete → gate flips → tabs) — after `db push` (set_nickname migration) + `functions deploy set-nickname` and a signed-in user. Avatar images need the `avatars` bucket populated.
- RNTL component tests deferred (logic at the data/fn layer; consistent with Bolt 1).

## User action to activate
`supabase db push` (adds set_nickname) + `supabase functions deploy set-nickname`.

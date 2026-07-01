# Bolt V2 — Stage 1: Model (Settings shell + Profile basics)

> Intent 002 · unit `profile-settings`. The Settings home + non-native profile edits. Traces to US-PS1/PS3/PS4/PS5 (+ PS6 entry), FR-PS1/PS3/PS4/PS5. Builds on V1 (locale store) + Bolt 6 (`fn_set_nickname`).

## Ubiquitous language
- **Settings** — the user's control center: Profile, Appearance, Language, Account/Security (V7), Notifications (V10), Sign out.
- **Profile edit** — change nickname (cooldown-gated) + change avatar (default set / Google photo now; upload → V8).
- **Appearance** — brand theme + light/dark (the existing ThemeSwitcher).
- **Language** — the locale selector (the existing LocaleSwitcher) + server sync to `profiles.locale`.
- **Nickname cooldown** — after onboarding, the free grace change is allowed; once `nickname_change_count ≥ 2`, further changes are locked for **30 days** from `nickname_updated_at` (server-enforced).

## In scope (V2)
FR-PS1 Settings home reachable from the shell · FR-PS3 Google-photo avatar · FR-PS4 nickname change w/ cooldown · FR-PS5 locale selector in Settings + `profiles.locale` sync · FR-PS6 a Notifications section entry (delegates to V10). Consolidate the temporary header controls (theme/locale) **into Settings**; move **Sign out** into Settings.

## Out of scope
Avatar upload (native image picker → V8); Account/Security actions (change email/pass, delete, MFA, passkeys → V7); notification preferences UI internals (→ V10).

## Domain rules
- **Nickname change (add cooldown to `fn_set_nickname`)**: keep regex + discriminator + `NICKNAME_TAKEN`; ADD a gate — if `onboarding_completed AND nickname_change_count ≥ 2 AND nickname_updated_at within 30 days` → raise `RATE_LIMITED`. Onboarding/first changes stay free. (mirrors web `set-nickname`)
- **Avatar**: default-set SVG keys (reuse V1/Bolt-6 local set) or the Google photo URL (`user_metadata.avatar_url`/`picture`) → `profiles.avatar_url` + `avatar_source` via the existing RLS own-row update.
- **Locale sync**: on locale change, if authenticated, also write `profiles.locale` (RLS own-row update); on boot, prefer `profiles.locale` when present over device default (best-effort).

## Navigation
Add a **Settings tab** (4th bottom tab, gear icon) → a Settings stack (home + sub-screens). Remove the temporary header theme/locale cycles and the header Sign-out (now in Settings) → clean headers.

## Invariants
- Cooldown enforced server-side in `fn_set_nickname` (client only surfaces the error).
- Avatar/locale writes are RLS own-row (no bypass); nickname via the guarded function.
- One source of truth for theme/locale (existing stores); Settings just hosts their controls.

## Out of model
Native avatar upload, security actions, notification internals (their bolts).

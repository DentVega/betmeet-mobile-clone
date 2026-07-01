# Bolt V2 — Settings shell + Profile basics — Outcome

- **Status:** ✅ Complete (verified on device)
- **Intent:** 002-v2-web-parity · unit `profile-settings` · Stories US-PS1/PS3/PS4/PS5 (+ PS6 entry)
- **DDD:** Model → Design+ADR-017 → Implement → Test (checkpoints approved)

## What shipped
- **Settings tab** (4th) → `SettingsStack` → `SettingsScreen` with sections: **Profile** (current nickname, 6 default-avatar grid, Google-photo option, change-nickname form), **Appearance** (ThemeSwitcher), **Language** (LocaleSwitcher + `profiles.locale` sync), **Account/Notifications** "coming soon" placeholders (→ V7/V10), **Sign out**.
- **Header consolidation**: theme/locale cycles + Sign-out removed from the tab headers (now in Settings); Pools/Settings tabs `headerShown:false` so their nested stacks own the header (fixes double-header).
- **`src/settings/`**: `useMyProfile` (RLS own-row read) + `profileApi` (changeNickname via `set-nickname` fn, setAvatar, googleAvatarUrl).
- **Nickname cooldown** (`fn_set_nickname`): after onboarding, 2 free changes then a 30-day lock → `RATE_LIMITED` (migration `20260701120000`). Added `RATE_LIMITED` to the Edge Function's known codes.
- **Locale server-sync**: `localeStore.setLocale` writes `profiles.locale` when authed; `applyLocale` (no write-back) applied from the profile on login (via `useSessionBootstrap`).
- i18n `settings.*` keys (es/en).

## ADR
ADR-017 — Settings as a 4th tab; consolidate controls into it; nickname cooldown enforced server-side.

## Verification
tsc clean; jest 54/54; cooldown validated on ephemeral PG (OK / RATE_LIMITED / expires after 30d). Device: 4-tab bar, Ajustes screen renders all sections; login applied the profile locale.

## Activation note
`supabase db push` needed to apply migration `20260701120000_nickname_cooldown` to remote before the cooldown is live there.

## Carried forward
- Avatar **upload** → V8 (native image picker). Account/security section → V7. Notification prefs section → V10.

## Next
Bolt V3 — Results & Auto-scoring (backend).

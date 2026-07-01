# Bolt V2 — Stage 2: Design + ADR-017 (Settings shell + Profile)

## ADR-017 — Settings as a 4th tab; consolidate controls; nickname cooldown server-side
- **Decision:** add a **Settings** bottom tab (label-only, like the others) → a Settings stack. Move the temporary header **theme/locale** cycles + **Sign out** into Settings. Add the **nickname cooldown** gate to `fn_set_nickname` (server-enforced). Locale server-sync: write `profiles.locale` from Settings when authed; read+apply on login.
- **Alternatives:** header gear button (rejected — a tab is more discoverable and hosts multiple sections); cooldown in the client (rejected — must be server-authoritative).
- **Consequences:** cleaner headers; one Settings home that V7 (Security) and V10 (Notifications) plug sections into; nickname changes now respect the 30-day lock.

## Backend
- **Migration `20260701120000_nickname_cooldown.sql`**: `create or replace` `fn_set_nickname` — same body + a gate at the top: read the caller's `onboarding_completed, nickname_change_count, nickname_updated_at`; if `onboarding_completed AND change_count ≥ 2 AND nickname_updated_at > now() - interval '30 days'` → `raise exception 'RATE_LIMITED'`. (No new deploy of the Edge Function — it already calls the RPC.)

## Mobile — `src/settings/`
```
data/
  useMyProfile.ts   # TanStack Query: read own profile (nickname_base/disc, avatar_url, avatar_source)
  profileApi.ts     # changeNickname (set-nickname fn), setAvatar (RLS update, default key | google url),
                    # updateLocale(userId,locale) (RLS update profiles.locale), googleAvatarUrl()
screens/
  SettingsScreen.tsx  # sections: Profile (nickname + avatar), Appearance (ThemeSwitcher),
                      # Language (LocaleSwitcher + server sync), [Security → V7], [Notifications → V10], Sign out
```
- **Profile section**: shows current nickname (`base#disc`); a "change nickname" inline form → `set-nickname` fn, surfacing `RATE_LIMITED`/`NICKNAME_TAKEN`/`INVALID` via `tr('settings.nickname.errors.*')`. Avatar: the default SVG grid (reuse `avatarKeys`/`<Avatar>`) + a "use Google photo" option when `user_metadata` has one; selecting writes `avatar_url`+`avatar_source`. Upload button placeholder → V8.
- **Appearance/Language**: reuse `ThemeSwitcher` + `LocaleSwitcher`; the Language control also calls `profileApi.updateLocale` when authed.
- **Sign out**: `authService.signOut()` (moved from header).

## Navigation
- `AppTabsParamList` gains `Settings: NavigatorScreenParams<SettingsStackParamList>`; `SettingsStackParamList = { SettingsHome }`.
- `AppTabs`: 4th `Settings` tab; **remove** `headerLeft` (theme/locale cycles) and `headerRight` (SignOut) → titles only.
- `useSessionBootstrap`: on auth, read `profiles.locale` and apply via `localeStore.setLocale` (best-effort).

## i18n
Add `settings.*` keys (title, profile, appearance, language, security, notifications, signOut, nickname change/errors, avatar google/upload) to es/en.

## Test
- Backend: `fn_set_nickname` cooldown on ephemeral PG (change_count ≥ 2 within 30d → RATE_LIMITED; free change otherwise).
- Pure/RNTL light; tsc + jest + bundle. Device: Settings tab renders, nickname change + language + sign out work.

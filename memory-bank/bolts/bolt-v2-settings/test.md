# Bolt V2 — Test (Settings shell + Profile)

## Backend (ephemeral PG17) — cooldown
Applied all **11 migrations** (incl. `20260701120000_nickname_cooldown`). `fn_set_nickname`:
- change_count 0 → **OK** (free).
- change_count ≥ 2 + `nickname_updated_at = now()` → raises **RATE_LIMITED** (cooldown active). ✓
- same count, last change 40 days ago → **OK** (cooldown expired). ✓

## Static / unit
- `tsc --noEmit` clean.
- `jest` 54/54 (localeStore mock extended to stub the supabase client now that the store syncs `profiles.locale`).

## Device
- Reloaded (JS-only). Bottom bar now shows **4 tabs**: Partidos · Ligas · Clasificación · **Ajustes**; headers are titles-only (theme/locale cycles + Sign-out removed from the header).
- **Ajustes** renders: Profile (nickname `vbrian212#5045`, 6-avatar grid, "upload (coming soon)", change-nickname form), Appearance (brand + light/dark), Language, Account/Notifications "coming soon" placeholders, Sign out.
- Locale on login now applies `profiles.locale` (app returned to ES from the profile default, overriding the device EN) — confirms server→client locale.

## Not covered
- Nickname change / avatar pick end-to-end on device against remote (needs the cooldown migration pushed) — logic validated on PG + tsc/jest.
- Google-photo option only shows for Google-signed-in users.

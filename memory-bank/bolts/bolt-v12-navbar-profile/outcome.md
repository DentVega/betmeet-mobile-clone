# Bolt V12 — Navbar language toggle + profile avatar → Profile screen — Outcome

- **Status:** ✅ Complete (verified on device). Intent 004 (condensed). JS-only, host bundle, no native module.
- **Stories:** FR-N1…N4.

## What shipped
- `src/ui/AppHeaderRight.tsx` — header-right: `LocaleCycleButton` (ES/EN) + profile avatar (from `useMyProfile`) → `navigation.navigate('Settings', { screen: 'Profile' })` (bubbles up from any navigator).
- `src/settings/screens/ProfileScreen.tsx` — read-only: large Avatar + nickname + email (`supabase.auth.getUser`) + "Editar en Ajustes" → SettingsHome.
- Wiring: `headerRight` set on the Tabs.Navigator (Matches/Rankings/Rules) + PoolsStack + SettingsStack; PoolsList given a header (title "Ligas"); `SettingsStackParamList += Profile`; i18n `profile.title/edit`.

## Verification
tsc clean; jest 54/54; device: header shows ES toggle + avatar; tapping the avatar opens Perfil (vbrian212#5045 + email + edit). Bilingual/themed.

## Notes
- Profile lives under the Settings stack → tapping the header avatar activates the Settings tab. Could be a root modal if tab-independent overlay is preferred.
- The avatar renders as an empty circle when the stored `avatar_url` is a default bucket URL with no uploaded image (pre-existing data; pick a default in Settings → Perfil).

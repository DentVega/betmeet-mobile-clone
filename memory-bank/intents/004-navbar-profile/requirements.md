# Intent 004 — Navbar: language toggle + profile avatar → Profile screen (condensed spec)

> Small header-UI + one screen → right-sized (one condensed doc + one bolt; per CLAUDE.md "/simple-spec for small"). Host bundle, no native module.

## Business intent
In the app navbar, besides the tab title, add (1) a **language toggle** and (2) a **profile avatar** that navigates to a **Profile screen**.

## Scope
- **In:** a shared header-right (`LocaleCycleButton` + avatar button) on the main headers; a read-only **ProfileScreen** (avatar + nickname + email) reachable by tapping the header avatar; an "edit" link into Settings.
- **Out:** editing profile from the new screen (that stays in Settings); redesigning the tab bar.

## Functional requirements
- **FR-N1** The header shows, on the right: a **language toggle** (ES/EN, reuses `LocaleCycleButton` from V1) + the user's **avatar** (from `useMyProfile`).
- **FR-N2** Tapping the header avatar navigates to a **Profile screen**.
- **FR-N3** ProfileScreen shows the avatar (large), nickname (`base#disc`), and email (from the session), + a button to Settings (edit).
- **FR-N4** Header-right appears across the main tabs (Matches, Rankings, Rules) and the Pools/Settings stacks; theme + locale reactive.

## Design (host bundle, no native module)
- **`src/ui/AppHeaderRight.tsx`** — `<View row>` with `LocaleCycleButton` (existing) + `ProfileAvatarButton` (renders `<Avatar url={profile.avatar_url} size={28} />` from `useMyProfile`; `onPress` → `navigation.navigate('Settings', { screen: 'Profile' })`, which bubbles up from any navigator).
- **`src/settings/screens/ProfileScreen.tsx`** — large `<Avatar>`, nickname, email (`supabase.auth.getUser`), "Editar en Ajustes" button → `SettingsHome`.
- **Nav** — `SettingsStackParamList += Profile`; register in `SettingsStack`.
- **Wiring** — set `headerRight: () => <AppHeaderRight />` in the `Tabs.Navigator` screenOptions (Matches/Rankings/Rules) + `PoolsStack` + `SettingsStack` screenOptions; give `PoolsList` a header (title "Ligas") so it's consistent.
- **Topology:** host bundle (single bundle, no MF). No native module.

## Bolt plan (single bolt: V12 — Navbar profile)
Implement AppHeaderRight + ProfileScreen + nav wiring + i18n (`profile.*`). Verify tsc/jest + device (header shows toggle + avatar on tabs; tapping avatar opens Profile; language toggle works from header). JS-only, no rebuild.

## Verification
tsc + jest; device: header toggle changes language; avatar visible; tapping it → ProfileScreen with photo/nickname/email.

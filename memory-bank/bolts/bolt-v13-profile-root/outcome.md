# Bolt V13 — Profile as a root screen — Outcome

- **Status:** ✅ Complete (verified on device). Intent 005 (condensed). JS-only, host bundle, no native module.

## What shipped
- `src/app/navigation/AppStack.tsx` — native stack wrapping the tabs: `Tabs` (AppTabs, headerShown:false) + `Profile` (ProfileScreen, themed header + back).
- `RootNavigator` App phase → `<AppStack/>` (was `<AppTabs/>`).
- `AppStackParamList = { Tabs, Profile }`; removed `Profile` from `SettingsStackParamList` + the Settings-stack Profile screen.
- `AppHeaderRight` → `navigate('Profile')` (opens the root overlay from any tab).
- `ProfileScreen` typed to AppStack; "Editar en Ajustes" → `navigate('Tabs', { screen: 'Settings' })`.

## Verification
tsc/jest 54/54; device: from Partidos, avatar → Perfil overlay (own header + back); back returns to Partidos (tab unchanged, selected=true); Settings tab keeps its edit content.

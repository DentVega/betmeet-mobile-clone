# Intent 005 — Profile as a root screen (condensed spec)

> Small navigation refactor → right-sized (one condensed doc + one bolt). Host bundle, no native module. Follows Intent 004 feedback.

## Business intent
The **Settings tab** should keep its "edit settings" content. The **Profile** should be its **own screen** navigated to from the navbar avatar — as an overlay that does **not** switch the active tab (today Profile lives under the Settings stack, so tapping the avatar hijacks the Settings tab).

## Root cause
`RootNavigator`'s App phase renders `<AppTabs/>` directly (no wrapping stack), so Profile had to live inside a tab's stack. Wrapping the tabs in an app-level stack lets Profile be a sibling screen presented over the tabs.

## Functional requirements
- **FR-P1** Wrap the tabs in an **AppStack** (native stack): `Tabs` (the bottom tabs) + `Profile` (a pushed screen with a back header).
- **FR-P2** The navbar avatar navigates to `Profile` (AppStack) → opens as an overlay; the underlying tab stays selected.
- **FR-P3** The **Settings tab** keeps SettingsHome + Security (the edit-settings content); Profile is removed from the Settings stack.
- **FR-P4** Profile's "Editar en Ajustes" → `navigate('Tabs', { screen: 'Settings' })` (closes the overlay + selects the Settings tab).

## Design (host bundle, no native module)
- **`src/app/navigation/AppStack.tsx`** — `createNativeStackNavigator`: `Tabs` (AppTabs, headerShown:false) + `Profile` (ProfileScreen, themed header + back).
- **`RootNavigator`** — App phase returns `<AppStack/>`.
- **types** — `AppStackParamList = { Tabs; Profile }`; remove `Profile` from `SettingsStackParamList`.
- **AppTabs** — drop the Settings-stack Profile screen.
- **AppHeaderRight** — `navigate('Profile')`.
- **ProfileScreen** — nav typed to AppStack; edit button → `navigate('Tabs', { screen: 'Settings' })`.

## Bolt plan (single bolt: V13)
Implement AppStack + rewire RootNavigator/types/AppTabs/AppHeaderRight/ProfileScreen. Verify tsc/jest + device (avatar opens Profile overlay from any tab without changing the tab; back returns; edit → Settings tab).

## Verification
tsc + jest; device: from Partidos, tap avatar → Perfil overlay (Partidos tab still underneath); back; "Editar en Ajustes" → Ajustes tab.

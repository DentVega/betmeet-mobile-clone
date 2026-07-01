# Intent 006 — Move profile editing (nickname + avatar) to the Profile screen (condensed spec)

> Small refactor → right-sized (one condensed doc + one bolt). Host bundle, no native module.

## Business intent
Settings currently holds a **Perfil** section (change nickname + pick avatar). Move that editing into the **Profile screen**; Settings keeps app preferences + account + sign out.

## Functional requirements
- **FR-E1** The **Profile screen** becomes editable: header (large avatar + nickname + email) + **avatar picker** (default set grid, Google-photo option, upload placeholder) + **change-nickname** form (cooldown-guarded server-side).
- **FR-E2** The **Settings** tab **removes** the Perfil section; keeps Appearance, Language, Cuenta y seguridad, Notificaciones, Cerrar sesión.
- **FR-E3** The Profile "Editar en Ajustes" button is removed (editing now lives here).
- **FR-E4** Same behavior/validation as before (nickname regex + `RATE_LIMITED`/`NICKNAME_TAKEN` errors; avatar writes via `setAvatar`; invalidate `['myProfile']`).

## Design (host bundle, no native module)
- **`ProfileScreen`** — add the profile-editing block moved from SettingsScreen: state (`nick`, `nickErr`, `nickDone`, `nickLoading`, `googleUrl`), `onChangeNick`, `pickAvatar`; render the avatar grid (`avatarKeys`) + Google option + upload placeholder + nickname `TextField` + change button under the read header. Reuses `t().settings.nickname/avatar/errors`.
- **`SettingsScreen`** — remove the Perfil section + its now-unused imports/state; keep Appearance/Language/Account/Notifications/Sign out.
- No i18n/nav/schema changes.

## Bolt plan (single bolt: V14)
Move the editing UI + logic to ProfileScreen; strip it from SettingsScreen; drop the "Editar en Ajustes" button. Verify tsc/jest + device (Profile edits nickname/avatar; Settings no longer shows Perfil).

## Verification
tsc + jest; device: Profile screen edits nickname + picks avatar (persists); Settings shows only Appearance/Language/Account/Notifications/Sign out.

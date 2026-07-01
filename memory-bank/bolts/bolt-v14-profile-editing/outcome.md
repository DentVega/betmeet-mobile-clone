# Bolt V14 — Move profile editing to the Profile screen — Outcome

- **Status:** ✅ Complete (verified on device). Intent 006 (condensed). JS-only, host bundle, no native module.

## What shipped
- `ProfileScreen` is now **editable**: read header (large avatar + nickname + email) + avatar picker (default grid + Google-photo option + upload placeholder) + change-nickname form (regex + RATE_LIMITED/NICKNAME_TAKEN; `setAvatar`/`changeNickname`; invalidate `['myProfile']`). Removed the "Editar en Ajustes" button.
- `SettingsScreen` **removed** the Perfil section (+ its now-unused imports/state); keeps Appearance, Language, Cuenta y seguridad, Notificaciones, Cerrar sesión.

## Verification
tsc/jest 54/54; device: Profile edits nickname + picks avatar (6-avatar grid, persists); Settings shows APARIENCIA/IDIOMA/CUENTA Y SEGURIDAD/NOTIFICACIONES/Cerrar sesión — no PERFIL.

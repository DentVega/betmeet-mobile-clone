# Unit: Profile & Settings

> Intent 002 (v2). Mirrors web `settings/profile` + Unit 17 (avatar/nickname).

## Purpose
The Settings surface + profile editing: avatar upload/Google photo, post-onboarding nickname change (cooldown), locale, notification-preferences entry.

## In scope
FR-PS1 Settings shell (Profile/Security/Notifications/Language tabs) · FR-PS2 avatar upload (native image picker → Storage) · FR-PS3 Google-photo avatar · FR-PS4 nickname change w/ cooldown · FR-PS5 locale selector · FR-PS6 notification-prefs UI (delegates to Notifications unit).

## Out of scope
Security actions (own unit); the push transport (Notifications unit).

## Integrations
`supabase.storage` signed-URL upload; `fn_set_nickname` (cooldown already implemented); `profiles.locale`; hosts the entries for Account & Security and Notifications units.

## Dependencies
Depends on: Auth/Onboarding (v1). Provides: the Settings navigation container the other v2 units plug into.

## Native module
**Image picker** (FR-PS2) — react-native-image-picker / expo-image-picker (Q3).

## Risk
Signed-URL upload + Storage RLS (own folder); nickname cooldown UX (surface the lock reason).

## Stories
`stories/` (US-PS1…PS6).

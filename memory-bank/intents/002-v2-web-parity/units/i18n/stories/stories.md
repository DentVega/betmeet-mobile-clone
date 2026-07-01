# Stories — i18n Completion

## US-IN1 — Language selector — FR-IN1
As a user I want to pick the app language.
- AC: an es/en selector in the shell + Settings; selecting changes the language.

## US-IN2 — Persist + live re-render — FR-IN2
As a user I want my language to stick and apply immediately.
- AC: the choice persists to `profiles.locale` + device and hydrates on boot; changing it re-renders all screens live (reactive locale store).

## US-IN3 — Complete dictionaries — FR-IN3
As a user I want all copy translated.
- AC: every v2 screen's copy exists in both es and en; no untranslated keys.

## US-IN4 — Bilingual rules — FR-IN4
As a user I want the rules in my language.
- AC: the rules content is available in es and en and shown per the selected locale.

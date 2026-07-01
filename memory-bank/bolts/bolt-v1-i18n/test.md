# Bolt V1 — Test (i18n foundation)

## Unit (Jest) — 54/54 (+3)
`src/i18n/__tests__/localeStore.test.ts`: setLocale updates store + mirrors i18n `getLocale` + persists (`betmeet.locale`); hydrate applies a persisted locale; hydrate falls back to a valid default when nothing stored. (secureStorage mocked.)

## Static
- `tsc --noEmit` clean.
- Hardcoded-string sweep: none in JSX/Alert; all copy via `t()`/`tr()`.

## Device
Reloaded (JS-only) and toggled the header language control ES→EN: the whole app re-rendered in English (header "Matches"/"Sign out", "Show earlier days", "Thursday, July 2", "SCHEDULED", "Predict", tabs) while brand (Deportivo) + scheme (Oscuro) persisted. Verified via uiautomator-located toggle + screenshot.

## Not covered
- Server `profiles.locale` sync (V2).
- Exhaustive dictionary coverage of *future* v2 screens (added per bolt).

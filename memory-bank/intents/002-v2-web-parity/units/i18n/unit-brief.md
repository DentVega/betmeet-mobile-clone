# Unit: i18n Completion

> Intent 002 (v2). Mirrors web FR-I18N-24, FR-REFINE-66.

## Purpose
Finish internationalization: a language selector, locale persistence, complete es/en dictionaries, and bilingual rules content. v1 shipped partial es/en dictionaries + `getLocale`/`setLocale` but no selector or persistence.

## In scope
FR-IN1 language selector (shell + Settings) · FR-IN2 persist to `profiles.locale` + device, hydrate on boot, re-render on change · FR-IN3 complete es/en dictionaries (all v2 copy) · FR-IN4 bilingual rules content.

## Out of scope
Additional languages beyond es/en.

## Integrations
Existing `src/i18n` (dictionaries + `t`/`tr`); `profiles.locale` (via Settings `set-locale`); a locale store hydrated on boot (like the brand/scheme store).

## Dependencies
Depends on: Profile & Settings (selector lives there + `set-locale`). Provides: localized copy for all v2 units.

## Native module
None.

## Risk
Re-render on locale change (the current `t()` reads a module-level `currentLocale` — needs a reactive store so screens update live); dictionary coverage across all new v2 screens.

## Stories
`stories/` (US-IN1…IN4).

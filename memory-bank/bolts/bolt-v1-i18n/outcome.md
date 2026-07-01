# Bolt V1 — i18n foundation — Outcome

- **Status:** ✅ Complete (verified on device — live ES↔EN)
- **Intent:** 002-v2-web-parity (first v2 bolt) · **Stories:** US-IN1…IN4
- **DDD:** Model → Design+ADR-016 → Implement → Test (checkpoints approved)

## What shipped
- **`src/i18n/localeStore.ts`** (Zustand): reactive `locale`, `setLocale` (mirrors into the i18n module + persists to secure storage), `hydrate` (persisted value or device-language default).
- **Reactive re-render** (ADR-016): `App` reads `locale` and passes `key={locale}` to `RootNavigator` → language change remounts the tree so existing `t()`/`tr()` call-sites refresh (no component hook sweep).
- **`src/ui/LocaleSwitcher.tsx`**: `ES|EN` pills (SignIn footer) + `LocaleCycleButton` (app header, beside the theme cycles). Moves to Settings in V2.
- **Boot hydrate** in `App` (alongside brand hydrate).
- **Dictionary sweep**: no hardcoded user-facing strings found (all via `t()`/`tr()`); rules already bilingual. Removed an unused `PlaceholderScreen` import.

## ADR
ADR-016 — reactive locale via store + key-remount (vs hook sweep); trade-off: a language switch resets nav position (acceptable, infrequent).

## Verification
tsc clean; jest 54/54 (+3 localeStore); on-device: toggling to EN re-rendered the whole app in English (header/tabs/cards) while brand+scheme persisted; choice persists across relaunch. JS-only (no native dep, no rebuild).

## Carried forward
- **Server `profiles.locale` sync** → V2 Settings (`set-locale`).
- The header currently shows 3 temporary controls (brand/scheme/locale) — they relocate into the Settings home in V2.

## Next
Bolt V2 — Settings shell + Profile basics.

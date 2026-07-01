# Bolt V1 — Stage 1: Model (i18n foundation)

> First Intent-002 (v2) bolt. Makes locale reactive + selectable + persisted, without a full component sweep. Traces to `intents/002-v2-web-parity/units/i18n/` (US-IN1…IN4, FR-IN1…IN4).

## Problem
`src/i18n/index.ts` holds a module-level `currentLocale`; `t()`/`tr()` read it. Screens call `t()` directly during render, so **changing locale does not re-render** them. Dictionaries (es/en) already exist and cover v1 copy; the onboarding rules body is already bilingual (FR-IN4 largely satisfied by the dictionary).

## Ubiquitous language
- **Locale** — `'es' | 'en'`. Single source of truth in a reactive store.
- **Locale store** — Zustand store `{ locale, setLocale, hydrate }`, persisted in secure storage (like the brand/scheme store). Mirrors its value into the i18n module (`setLocale`) so `t()`/`tr()` stay correct.
- **Reactive re-render** — the app tree remounts when locale changes (React `key`), so existing `t()` call-sites pick up the new dictionary **without converting every component to a hook**.
- **Language selector** — a small ES/EN control (like the theme switcher).

## Approach (framework-light, low-churn)
1. **`localeStore`** (Zustand): `locale` (default from `DEFAULT_LOCALE`), `setLocale(l)` → updates store + calls i18n `setLocale(l)` + persists to secure storage; `hydrate()` reads persisted value on boot (falls back to default; device-language detection optional).
2. **Reactive bridge**: the App reads `locale` from the store and passes `key={locale}` to the navigator/root, so a locale change remounts the tree → all `t()` results refresh. (Language switches are infrequent; a remount is acceptable and avoids a hook sweep.)
3. **Selector UI**: an `ES | EN` toggle placed where the theme switcher lives (SignIn footer + app header); moves into Settings in Bolt V2.
4. **Persistence scope (V1)**: device (secure storage) only. **`profiles.locale` sync** (server) is deferred to V2 Settings (`set-locale`), noted here.
5. **Dictionary coverage**: sweep for any hardcoded user-facing strings in existing screens and route them through the dictionaries.

## Invariants
- One source of truth for locale (the store); the i18n module value is always kept in sync so `t()`/`tr()` never diverge.
- Changing locale updates every visible screen (via remount) and persists across restarts.
- No secret/token involved; secure storage is reused only as a simple persisted KV.

## Out of model
Server `profiles.locale` sync + the Settings home (Bolt V2); adding languages beyond es/en.

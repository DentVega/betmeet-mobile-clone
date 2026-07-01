# Bolt V1 — Stage 2: Design + ADR-016 (i18n foundation)

## ADR-016 — Reactive locale via store + key-remount
- **Decision:** a Zustand `localeStore` is the source of truth; `setLocale` mirrors into the i18n module (so `t()`/`tr()` stay correct) and persists to secure storage. The App reads `locale` and passes `key={locale}` to `RootNavigator` so a change **remounts** the tree and existing `t()` call-sites refresh — no component-wide hook sweep.
- **Alternatives:** convert `t()`→`useT()` hook + update every screen (rejected for V1 — large churn; revisit if per-component reactivity is needed); context provider re-render (still needs call-sites to read context).
- **Consequences:** language switch remounts the current navigation stack (resets nav position) — acceptable for an infrequent action. Server `profiles.locale` sync deferred to V2.

## Structure
- **`src/theme`… no** — i18n lives in `src/i18n`. Add **`src/i18n/localeStore.ts`** (Zustand): `{ locale, setLocale(l), hydrate() }`.
  - `setLocale`: `set({locale})` → `i18nSetLocale(l)` → `secureStorage.setItem('betmeet.locale', l)`.
  - `hydrate`: read persisted; else device default (`Intl…` → 'en' if device is English, else 'es'); apply via the same path.
- **`src/i18n/index.ts`**: unchanged API (`t`/`tr`/`getLocale`/`setLocale`); the store calls `setLocale`.
- **App.tsx**: `useEffect(hydrate)`; read `locale` from the store; `<RootNavigator key={locale} />` (inside NavigationContainer) to remount on change.
- **`src/ui/LocaleSwitcher.tsx`**: `ES | EN` pills (styled like ThemeSwitcher) using `localeStore`. Placed on the SignIn footer (below ThemeSwitcher) and a compact toggle appended to the app header (headerLeft, alongside the theme cycles). Moves into Settings in V2.

## Dictionary coverage
Sweep `src/**` for hardcoded user-facing strings (JSX text / Alert / labels) not going through `t()`/`tr()`; route any found into `es.ts`/`en.ts`. Bilingual rules already satisfied by `onboarding.rules.body`.

## Test surface
- Pure: `localeStore` (setLocale updates + persists + mirrors i18n; hydrate applies persisted/device default) with secureStorage mocked.
- Device: switch ES↔EN → whole app re-renders in the new language, persists across relaunch.
- tsc + jest + bundle.

# Tech Stack

> Read by every AI-DLC agent before acting. Keep current.

## Core
- **Framework:** React Native **0.86.0** (New Architecture / Fabric + TurboModules) with React **19.2.3**.
- **Bundler:** **Re.Pack 5.2.5** (Rspack `@rspack/core` 1.7.8) — **NOT Metro**. Do not generate Metro-specific config. Config lives in `rspack.config.mjs`.
- **Code splitting / microfrontends:** **Single bundle for now — Module Federation deliberately deferred.** The app ships as one Re.Pack/Rspack bundle (`rspack.config.mjs`). Module Federation v2 (host + on-demand remote chunks, JS or Hermes bytecode) is supported by the stack but **not** in use. Scaffold it via `/repack-init` only when a real on-demand-chunk requirement is confirmed.
- **JS engine:** Hermes (bytecode chunks, tree-shaking enabled).
- **Language:** TypeScript **5.8.3** (`@react-native/typescript-config`).

## Conventions
- Lists: **FlashList** (not FlatList) for any scrolling collection. _Not yet added as a dependency — add `@shopify/flash-list` when the first list is built._
- Navigation: native-stack / native navigators (not JS-only stacks). _Not yet chosen — pick a native navigator before the first multi-screen flow._
- State: _Not yet chosen — decide (e.g. Zustand / Redux Toolkit / React Query) during the first stateful bolt._
- Package manager / monorepo: **npm** (`package-lock.json`). Single package today; promote remotes to workspace packages if/when the app grows.

## Federation boundaries (deferred)
- **Current topology: single bundle.** There are no host/remote boundaries to define yet.
- When/if Module Federation is adopted: host bundle would contain core nav, auth, shared UI; feature chunks downloaded on demand; shared singletons across chunks (`react`, `react-native`, `react-native-safe-area-context`, navigation + state libs once chosen) pinned to avoid duplication.

## Performance budget
- Target FPS: 60. Time-to-interactive: _TBD_ ms. Host chunk ceiling: _TBD_ KB.

## Project note
- Project entry/working tag for this init: **prueba** (`betmeet-mobile-clone`, app name `BetmeetMobile`).

# ADR-001 — Navigation: React Navigation v7

- **Status:** Accepted (Bolt 0)
- **Context:** Bare RN 0.86 (New Arch) + Re.Pack, single bundle. Need native-feeling stacks + bottom tabs and a linking config for `betmeet://` deep links, without adopting Expo. Standards require "native navigators".
- **Decision:** Use **React Navigation v7** — `@react-navigation/native` with `native-stack` + `bottom-tabs` on `react-native-screens`. Linking handled by React Navigation's `LinkingOptions`.
- **Alternatives:** expo-router (rejected — pulls in the Expo module system, heavy for a bare Re.Pack app); roll-your-own (rejected — needless risk).
- **Consequences:** New-Arch-compatible native screens; typed param lists in `src/app/navigation/types.ts`; deep-link routing centralized in `linking.ts`. Adds `react-native-screens` native dep (Pods/autolinking). Stack switching is driven declaratively by `resolveAppPhase` + the Zustand session store.

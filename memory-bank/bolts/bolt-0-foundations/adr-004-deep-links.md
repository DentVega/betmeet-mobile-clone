# ADR-004 — Deep links: custom `betmeet://` scheme (v1)

- **Status:** Accepted (Bolt 0); revisit for Universal/App Links (intent Q4)
- **Context:** Email confirm/reset links and pool-invite links must open the app at the right screen (`system-context.md` §4). Some links are opened pre-auth and must survive auth/onboarding (parking).
- **Decision:** Register the **custom scheme `betmeet://`** via React Navigation `LinkingOptions` for v1. Recognized routes: `auth/confirm`, `auth/reset`, `pools/join/:token`. Parkable `poolJoin` intents are stored in `sessionStore` and replayed once phase = App.
- **Alternatives:** Universal Links (iOS) + App Links (Android) now (deferred — needs https associated-domains + `apple-app-site-association` / `assetlinks.json` hosting; more setup, scheduled for a later bolt).
- **Consequences:** Fast to ship; works in-app and for most email clients. Native registration: iOS `CFBundleURLSchemes`, Android `intent-filter scheme="betmeet"`. Risk: a few email clients strip custom schemes — mitigated later by adding Universal/App Links without changing the routing model (`parseDeepLink` stays the same).

# ADR-013 — FlashList for the fixture (first long list)

- **Status:** Accepted (Bolt 7)
- **Context:** The Matches screen is the project's first scrolling collection (up to ~104 matches). Project standards mandate FlashList over FlatList for scrolling lists; FlashList was deferred until the first list (this bolt).
- **Decision:** Adopt **`@shopify/flash-list`**. Render the day-grouped fixture as a **flattened, typed row array** (`day-header | match`) with `getItemType` so the recycler pools header vs match cells separately; memoized `MatchCard`; stable `keyExtractor`; grouping computed in a selector/`useMemo`.
- **Alternatives:** FlatList (rejected — violates the standard; worse recycling for the mixed header/row list); SectionList (rejected — heavier, and FlashList has no native sections, flattening is the idiom).
- **Consequences:** Native dependency → `pod install` (iOS) + Gradle rebuild before the list works on device (flagged to the user). New-Arch compatible. Sets the list pattern reused by Pools (Bolt 8) and Leaderboard (Bolt 9).

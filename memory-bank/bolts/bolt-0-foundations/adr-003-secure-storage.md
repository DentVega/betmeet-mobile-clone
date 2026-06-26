# ADR-003 — Secure storage: react-native-keychain

- **Status:** Accepted (Bolt 0)
- **Context:** Supabase session (access + refresh tokens) must persist in encrypted OS storage, not plain AsyncStorage (NFR-5). Web used httpOnly cookies; mobile has no equivalent.
- **Decision:** **react-native-keychain** wrapped as a `{ getItem, setItem, removeItem }` adapter and passed to the Supabase client as `auth.storage`.
- **Alternatives:** expo-secure-store (rejected — requires `expo-modules-core` in a bare app just for storage); plain AsyncStorage (rejected — insecure for tokens).
- **Consequences:** Tokens stored in iOS Keychain / Android Keystore. One keychain entry per Supabase storage key. New-Arch compatible. Adds a native dependency (Pods/autolinking). The adapter is the only writer of secrets — enforces the model invariant that no token leaves secure storage.

# ADR-006 — Google OAuth via system browser + PKCE

- **Status:** Accepted (Bolt 1)
- **Context:** v1 needs Google sign-in (FR-A4) on bare RN without Expo. Supabase mobile auth + OAuth/recovery deep links work best with the PKCE flow. The `betmeet://` deep-link return is already wired (Bolt 0).
- **Decision:**
  - Configure the Supabase client with `auth.flowType: 'pkce'` (keep `detectSessionInUrl:false`, secure-storage session).
  - Google OAuth uses the **system browser via `Linking`**: `signInWithOAuth({ provider:'google', options:{ redirectTo:'betmeet://auth/callback', skipBrowserRedirect:true } })` → `Linking.openURL(url)` → on return, parse `authCallback` → `exchangeCodeForSession(code)`.
  - Add an `authCallback` intent to `parseDeepLink`.
- **Alternatives:** in-app browser via `react-native-inappbrowser-reborn` (rejected for v1 — better UX but a new native dependency requiring a rebuild on both platforms; revisit if the system-browser hop proves unacceptable). expo-web-browser (rejected — pulls in Expo modules).
- **Consequences:** No new native dependency; reuses existing deep-link plumbing. UX briefly leaves the app to the system browser and returns. Requires the redirect URLs (`betmeet://auth/callback`, `/auth/reset`, `/auth/confirm`) to be allow-listed in the Supabase dashboard — a backend-config (not code) prerequisite. PKCE also makes email confirm/recovery use `verifyOtp` with `token_hash`.

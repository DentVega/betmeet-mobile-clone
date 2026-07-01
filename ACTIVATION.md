# ACTIVATION — pending manual steps

Everything in code is done, migrated, and deployed. These are the **manual / provisioning** steps that can't be done from the codebase. Each is independent; do them when you need that feature. Project ref: `uyhymoykzwlovnqpzwnn`.

Status legend: 🔴 required for core flows · 🟡 optional/feature-specific.

---

## 1. 🔴 Supabase Dashboard — auth redirect URLs + avatars bucket
Needed for email confirm/reset deep links and for avatar images to load.

1. **Auth → URL Configuration → Redirect URLs** — add:
   - `betmeet://auth/callback`
   - `betmeet://auth/reset`
   - `betmeet://auth/confirm`
2. **Storage** — the `avatars` bucket already exists (created by migration `20260701160000`, public read + owner-folder RLS). Upload the 6 default avatars to `avatars/defaults/01.png … 06.png` so the seeded default-avatar URLs resolve. (The app currently renders local SVG avatars, so this only matters if you switch to the hosted PNGs.)

---

## 2. 🟡 iOS native build (fonts, SVG, passkeys, push)
The app has only been built/tested on Android. For iOS:
```bash
bundle exec pod install --project-directory=ios
npm run ios
```
Add for the native features below: passkeys → Associated Domains entitlement + `apple-app-site-association`; push → APNs key + `GoogleService-Info.plist` + Push Notifications capability.

---

## 3. 🟡 V8 — Avatar upload (deferred: RN 0.86 lib incompatibility)
`react-native-image-picker` (7.x/8.x) fails to build on RN 0.86 (New-Arch codegen `MissingValueException`). **Backend is ready** (avatars bucket + `CUSTOM_UPLOAD` enum). To reactivate:
1. A picker library that builds on RN 0.86 New Arch (or an RN codegen fix / `patch-package`).
2. Restore `src/settings/data/avatarUpload.ts` from `memory-bank/bolts/bolt-v8-avatar/design.md`.
3. Re-wire the SettingsScreen "Subir foto" button (currently the "(próximamente)" placeholder); drop the suffix.
4. Rebuild + test pick→upload→set.

---

## 4. 🟡 V9 — Passkeys (code-complete; needs RP domain)
The native lib builds & loads. To make the passkey **register** flow work:
1. **A domain you control** as the WebAuthn Relying Party (RP).
2. Host `https://{RP}/.well-known/assetlinks.json` with the app's signing **SHA-256** (Android). For iOS, host `apple-app-site-association` + add the Associated Domains entitlement.
3. Configure Supabase **WebAuthn RP** settings (rpId / origins) and enable the `webauthn` factor.
4. Set `PASSKEY_RP_ID=<your-domain>` in `.env` → rebuild. The Passkeys section appears in Settings → Cuenta y seguridad only when this is set.
5. Verify register on device; then implement + verify **passwordless sign-in** (deferred — the DOM-serialization bridge in `src/auth/passkeys.ts` is unverified until a real ceremony runs).

Get the debug SHA-256:
```bash
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA256
```

---

## 5. 🟡 V10 — Push notifications (code-complete; needs Firebase)
Schema live, `notifications-dispatch` deployed. To deliver real pushes:
1. **Firebase project** → download the real `android/app/google-services.json` (replaces the gitignored placeholder). iOS: `GoogleService-Info.plist` + APNs key.
2. **FCM v1 service account** JSON →
   ```bash
   supabase secrets set FCM_SERVICE_ACCOUNT="$(cat service-account.json)"
   ```
3. **Schedule the dispatcher** — invoke `notifications-dispatch` on a cadence (pg_cron + pg_net, or an external cron), with header `x-admin-secret: <ADMIN_SECRET>`:
   ```
   POST https://uyhymoykzwlovnqpzwnn.functions.supabase.co/notifications-dispatch
   ```
4. **`index.js`** — register `messaging().setBackgroundMessageHandler(...)` and wire tap→deep-link (`onNotificationOpenedApp` / `getInitialNotification` → route `data.link`).
5. (Deferred) `rank_up` / `goal` event emission.

---

## 6. 🟡 Data / results (already usable)
Auto-scoring is live (V3): enter a result via the `enter-result` function → the trigger scores automatically → Realtime + `match_end` events fire.
```
POST https://uyhymoykzwlovnqpzwnn.functions.supabase.co/enter-result
Header: x-admin-secret: <ADMIN_SECRET>
Body:   { "matchId": "...", "homeScore": 2, "awayScore": 1 }          # FINISHED + auto-score
        { "matchId": "...", "homeScore": 1, "awayScore": 0, "status": "LIVE" }   # live score (for realtime/projection)
        { "matchId": "...", "revert": true }                          # clear result
```

---

## Current backend state
- **17 migrations** applied to remote.
- **12 Edge Functions** ACTIVE: save-prediction, create/join/leave/kick/delete-pool, compute-score, set-nickname, enter-result, delete-account, notifications-dispatch.
- Secrets set: `ADMIN_SECRET`. Still to set for push: `FCM_SERVICE_ACCOUNT`.

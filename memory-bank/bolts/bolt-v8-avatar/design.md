# Bolt V8 — Stage 2: Design + ADR-023 (Avatar upload — native)

## ADR-023 — Storage owner-folder RLS; base64 upload; guarded migration
- **Bucket:** public-read `avatars`; write RLS on `storage.objects` restricts insert/update/delete to `avatars/{auth.uid()}/…`. Public read → `avatar_url` is a plain public URL.
- **Upload path:** `react-native-image-picker` (base64) → `base64-arraybuffer` decode → `storage.upload(ArrayBuffer, {contentType, upsert})`. Blob/File on RN is unreliable; base64→ArrayBuffer is the robust path.
- **Migration guard:** the storage DDL runs inside a `DO` block that returns early unless `storage.objects` exists (via `information_schema`), with `EXECUTE` for the policy DDL → no-op on the ephemeral PG test, applies on remote.
- **Library-only:** no camera → no runtime permission on this first native bolt.

## Files
- **Migration `20260701160000_avatars_storage.sql`** — guarded: bucket insert (public) + `avatars_read` (public select) + `avatars_insert/update/delete_own` (folder = uid).
- **deps** — `react-native-image-picker`, `base64-arraybuffer` (`--legacy-peer-deps`) → Android rebuild (autolink).
- **`src/settings/data/avatarUpload.ts`** — `pickAndUploadAvatar(userId)`: launch library picker (maxW/H 512, base64) → decode → upload `avatars/{uid}/avatar.jpg` (upsert) → public URL (cache-busted) → `setAvatar(userId, url, 'CUSTOM_UPLOAD')`. Returns `{ok, code?, url?}` (CANCELLED/INVALID/INTERNAL).
- **`profileApi.setAvatar`** — source type += `'CUSTOM_UPLOAD'`.
- **`SettingsScreen`** — replace the "Subir foto (próximamente)" text with a **Subir foto** button (loading + error → invalidate `['myProfile']`).

## Rebuild
`npm i react-native-image-picker base64-arraybuffer --legacy-peer-deps` → `npm run android` (autolinked; New-Arch compatible). iOS `pod install` deferred.

## Test
- Migration on ephemeral PG → confirm it's a clean no-op (no storage schema).
- tsc + jest.
- Device: Settings → Perfil → Subir foto → pick an image → uploads → avatar updates across the app; re-open confirms persistence.

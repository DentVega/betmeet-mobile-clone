# Bolt V8 — Stage 1: Model (Avatar upload — native)

> Intent 002 · unit `profile-settings` (FR-PS2). **First native-module bolt** → adds `react-native-image-picker` + a rebuild. Traces to US-PS2.

## Ubiquitous language
- **Pick** — choose a photo from the device library (via `react-native-image-picker` `launchImageLibrary`, base64 output).
- **Upload** — write the image to the Supabase Storage `avatars` bucket at `avatars/{uid}/avatar.jpg` (upsert), RLS-scoped to the owner's folder.
- **Set** — point `profiles.avatar_url` at the public URL + `avatar_source = 'CUSTOM_UPLOAD'` (enum already has it). The `<Avatar>` component already renders http URLs.

## Existing / reconciled
- `AvatarSource` enum already includes `CUSTOM_UPLOAD`.
- No Storage bucket yet (`avatars` is referenced by the default-avatar seed but never created). V8 creates it (public read) + owner-folder write policies via a **guarded migration** (no-op on the ephemeral PG test, applies on remote).
- Native: `react-native-image-picker` not installed; New Arch is on (lib v7+ supports it). Library-only (no camera) to avoid runtime-permission complexity on this first native bolt.

## Deliverables
1. **Migration `avatars_storage`** — `storage.buckets` insert (public) + `storage.objects` RLS: authenticated insert/update/delete where the first path segment = `auth.uid()`. Wrapped in a `DO`/`EXECUTE` guard on `storage` schema presence.
2. **Native dep** — `react-native-image-picker` (+ `base64-arraybuffer` to decode) → Android rebuild.
3. **`src/settings/data/avatarUpload.ts`** — `pickAndUploadAvatar(userId)`: launch picker → base64 → decode → `storage.upload(path, bytes, {upsert, contentType})` → public URL → `setAvatar(userId, url, 'CUSTOM_UPLOAD')`.
4. **SettingsScreen** — the "Subir foto (próximamente)" placeholder becomes a working **Subir foto** button (loading + error).
5. `profileApi.setAvatar` source type += `'CUSTOM_UPLOAD'`.

## Invariants
- Uploads land only in the caller's own folder (`avatars/{uid}/…`) — enforced by the Storage RLS policy, not the client.
- Bucket is public-read so `avatar_url` is a plain public URL (consistent with default avatars).
- No camera/permission surface in V8 (library picker only).

## Out of model
Camera capture; image cropping/editing UI; iOS rebuild (`pod install`, deferred — Android is the test target).

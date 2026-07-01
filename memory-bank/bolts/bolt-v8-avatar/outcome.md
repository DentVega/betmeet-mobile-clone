# Bolt V8 — Avatar upload (native) — Outcome: ⛔ DEFERRED (blocked by RN 0.86)

- **Status:** ⛔ **Deferred** — the native image-picker library does not build on React Native 0.86.
- **Intent:** 002-v2-web-parity · unit `profile-settings` (FR-PS2) · Story US-PS2
- **DDD:** Model → Design+ADR-023 → Implement → **blocked at native rebuild**

## Blocker (root cause)
`react-native-image-picker` **7.2.3 and 8.2.1** both fail the Android build at **configuration time**:
```
Could not determine the dependencies of task ':react-native-image-picker:compileDebugJavaWithJavac'.
> Cannot query the value of this provider because it has no value available.  (MissingValueException)
```
The library's New-Arch path adds `${buildDir}/generated/source/codegen/java` to its sourceSet and applies `com.facebook.react`; under **RN 0.86** that codegen-output provider is never wired, so the file collection has no value. Identical failure on both versions → it's an **RN 0.86 codegen contract** issue, not a library-version issue. Patching the lib's gradle is fragile; deferred by decision.

## What IS ready (for reactivation when a compatible picker exists)
- ✅ **Storage**: migration `20260701160000_avatars_storage` — `avatars` bucket (public read) + owner-folder RLS on `storage.objects` — **applied to remote** (validated no-op on ephemeral PG). Reusable as-is.
- ✅ `AvatarSource` enum already has `CUSTOM_UPLOAD`; `profileApi.setAvatar` accepts it.
- ✅ The upload flow code is preserved in `design.md` (`pickAndUploadAvatar`: pick → base64 → `base64-arraybuffer` decode → `storage.upload(avatars/{uid}/avatar.jpg)` → public URL → setAvatar). The `avatarUpload.ts` file was removed to keep the build green; restore it verbatim from design.md when a picker builds.

## Reverted to keep the app healthy
- Uninstalled `react-native-image-picker` (its presence breaks the native build via autolinking).
- SettingsScreen "Subir foto" reverted to the "(próximamente)" placeholder text.
- tsc/jest green; clean Android rebuild restored.

## Retained (harmless)
- The `avatars` Storage bucket + policies on remote.
- `base64-arraybuffer` dep (pure-JS; used by the future upload).

## Reactivation checklist (future)
1. A picker library that builds on RN 0.86 New Arch (or RN codegen fix / patch-package).
2. Restore `src/settings/data/avatarUpload.ts` from design.md; re-wire the SettingsScreen button; drop the "(próximamente)" suffix.
3. Rebuild + device test the pick→upload→set flow.

## Note for V9/V10
The same RN 0.86 native-lib codegen risk applies to **V9 (passkeys)** and **V10 (push)** — probe each native dep's build early before implementing the full feature.

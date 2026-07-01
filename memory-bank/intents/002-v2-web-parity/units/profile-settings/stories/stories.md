# Stories — Profile & Settings

## US-PS1 — Settings area — FR-PS1
As a user I want a Settings screen to manage my account/app.
- AC: reachable from the shell; shows Profile · Security · Notifications · Language sections; each opens the right unit's screens.

## US-PS2 — Avatar upload — FR-PS2
As a user I want to upload my own avatar.
- AC: pick from library/camera → uploads to Storage → set as my avatar (shown across the app); size/type validated; cancel is safe.

## US-PS3 — Google-photo avatar — FR-PS3
As a Google-signed-in user I want to use my Google photo.
- AC: option appears when signed in via Google; selecting sets `avatar_source=GOOGLE_PHOTO`.

## US-PS4 — Change nickname — FR-PS4
As a user I want to change my nickname after onboarding.
- AC: change assigns a new discriminator; after 2 changes a 30-day cooldown blocks further changes with a clear message (server-enforced).

## US-PS5 — Language selector — FR-PS5
As a user I want to switch app language.
- AC: choosing es/en re-renders the app live and persists to my profile + device (see i18n unit).

## US-PS6 — Notification preferences — FR-PS6
As a user I want to control which notifications I get.
- AC: per-event toggles saved; reflected by the dispatcher (see Notifications unit).

# Stories — Onboarding

## US-O1 — Onboarding gate — FR-O1
As the app I want to require onboarding before app access so that every player has a profile.
- AC: Given a signed-in user with `onboardingCompleted=false`, when they enter the app, then they are routed into the onboarding stack and cannot reach the tabs.
- AC: Given `onboardingCompleted=true`, then onboarding is skipped.

## US-O2 — Choose nickname — FR-O2
As a new user I want a unique nickname so that others recognize me on leaderboards.
- AC: Given I type a nickname, when I check availability, then I see whether it's free (case-insensitive) and the discriminator I'd be assigned.
- AC: Given an available nickname, when I confirm, then it's saved and I advance to the avatar step.
- AC: Given a taken/invalid nickname, then submission is blocked with a message.

## US-O3 — Choose avatar — FR-O3
As a new user I want to pick an avatar so that my profile has an image.
- AC: Given the avatar step, then I can select from the default set (and my Google photo if I used OAuth) and it's saved.
- AC: Custom upload is not offered in v1.

## US-O4 — Acknowledge rules & complete — FR-O4, FR-O5
As a new user I want to read the rules and finish onboarding so that I can start playing.
- AC: Given the rules step, when I acknowledge, then I can complete onboarding.
- AC: Given I complete onboarding, then `onboardingCompleted=true` and I enter the app tabs.
- AC: Given any step, when I tap Back, then I return to the previous step with my entered data intact.

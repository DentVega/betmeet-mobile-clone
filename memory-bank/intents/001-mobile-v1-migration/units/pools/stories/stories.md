# Stories — Pools

## US-P1 — My pools — FR-P1
As a player I want to see the pools I'm in so that I can navigate to each.
- AC: Given the pools tab, then I see each pool's name, type, member count/capacity, and owner; tapping opens its detail.

## US-P2 — Create a pool — FR-P2
As a player I want to create a pool so that I can invite friends.
- AC: Given valid name (≤60), capacity, and type, when I create, then the pool is created and I'm taken to its detail as owner.
- AC: Invalid input is blocked with messages.

## US-P3 — Discover & join public pools — FR-P3, FR-P7
As a player I want to find and join public pools so that I can compete more widely.
- AC: Given the discover screen, then I can search and page through public pools.
- AC: When I join a public pool, then membership is created (anytime), unless capacity is full or I'm already a member, in which case I see the server error.

## US-P4 — Join by token / deep link — FR-P4, FR-P7
As an invited player I want to join via a token link so that joining is one tap.
- AC: Given `betmeet://pools/join/TOKEN`, when opened while signed in & onboarded, then I join and land on the pool detail.
- AC: Given the link while unauthenticated/not onboarded, then the join intent is parked, I complete auth/onboarding, and the join then completes.
- AC: Invalid/expired token shows an error.

## US-P5 — Pool detail — FR-P5
As a member I want a pool's detail so that I can invite others and reach its leaderboard.
- AC: Given a pool detail, then I see header info, can copy the invite token, and can open the pool leaderboard and the matches screen.

## US-P6 — Manage membership — FR-P6, FR-P7
As a member/owner I want to leave or manage members so that the pool stays correct.
- AC: Given I'm a member, when I leave, then my membership is archived (anytime).
- AC: Given I'm the owner, then I can kick a member or delete the pool (anytime); non-owners cannot.

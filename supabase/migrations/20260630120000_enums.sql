-- Bolt 3 — v1 enums (subset of the betmeet-clone blueprint; provider/notification enums omitted).

create type "VerificationStatus" as enum ('UNVERIFIED', 'VERIFIED', 'ADMIN');
create type "AvatarSource" as enum ('GOOGLE_PHOTO', 'DEFAULT_SET', 'CUSTOM_UPLOAD');
create type "PoolType" as enum ('PUBLIC', 'PRIVATE');
create type "CompetitionPhaseType" as enum ('GROUP', 'KNOCKOUT', 'LEAGUE');
create type "MatchStatus" as enum ('SCHEDULED', 'LOCKED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED');
create type "PredictionLockReason" as enum ('KICKOFF_REACHED', 'MATCH_STATUS_LOCKED', 'MATCH_NOT_EDITABLE', 'POSTPONED', 'CANCELLED');
create type "ScoreMatchedCase" as enum ('EXACT', 'RESULT', 'PARTIAL', 'MISS');

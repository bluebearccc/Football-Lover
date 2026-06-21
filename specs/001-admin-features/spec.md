# Feature Spec — Admin Features (GoalPredict Live)

| Field | Value |
|---|---|
| Feature ID | 001-admin-features |
| Base branch | `main` (pulled) |
| Status | Draft → Implemented |
| Source of truth | `docs/Football-Lover/SRS_Football-Lover_v1.0.0.md` (v1.1.0), ER + UC class diagrams |
| Covers UCs | UC06, UC07, UC12, UC13 + "Manage users" + comment moderation + admin dashboard |
| Related BRs | BR07–BR14, BR23, BR26–BR30 |
| Related FRs | FR-06, FR-07, FR-08 (admin), FR-09 (admin dashboard), FR-12, FR-13, FR-14, FR-15, FR-16 |

## 1. Goal

Deliver the complete **ADMIN** surface of the application so an administrator can manage the
data and lifecycle of the prediction game: teams & players, matches & official results (with
automatic scoring, gold payout and notifications), prediction criteria, users, and comment
moderation, plus a dashboard with system counts. Every admin endpoint requires
`authenticate` + `requireRole('ADMIN')`.

## 2. In scope

### 2.1 Manage Teams & Players (UC13, FR-14)
- Create / edit / deactivate teams (`is_active`); list teams (filter active/name).
- Hard delete rejected when a team is referenced by any match → deactivate instead (AC-13-02).
- Manage players of a team (create/edit/delete); `external_id` mapping for sync.
- Missing `logo_url` / `image_url` → default-image fallback in FE (AC-13-03).

### 2.2 Manage Matches & Results (UC06, FR-06, FR-15, FR-16)
- Create / edit matches referencing Team records (not free text); set `entry_gold` (default 100).
- Validation: home ≠ away (BR08, AC-06-02), valid `match_time`, non-negative `entry_gold` and
  scores; started/finished match core fields locked (BR09).
- Cancel match → status CANCELLED, void participations, MATCH_CANCELLED notifications (BR14, BR30).
- No hard delete when related data exists → reject / switch to CANCELLED (BR23, AC-06-03).
- Set per-criterion `result_team`; update official result → triggers scoring workflow.

### 2.3 Scoring, Gold Payout, Notifications (BR12–BR14, BR26–BR30, FR-15/16)
- On FINISHED, **idempotent** (`prisma.$transaction`, once per match):
  1) resolve criteria results, 2) score = #correct criteria per participant,
  3) pool = `entry_gold` × participants, 4) winners = max score & ≥ 1 (ties share),
  5) `gold_won` = pool ÷ winners rounded to **2 decimals** (Decimal, never float),
  6) record `MatchParticipation`, 7) notify MATCH_WON/MATCH_LOST.
- Highest score 0 → no winner, pool void. `< 2` participants → no leaderboard contribution (BR29).

### 2.4 Manage Prediction Criteria (UC07, FR-07)
- Create / edit / delete criteria per match; block fairness-affecting edits after match lock.

### 2.5 Manage Users (Actor table, FR-10)
- List users (search/paginate), lock / unlock (`UserStatus`), change role, view detail.

### 2.6 Comment Moderation (FR-08)
- Admin can hide / soft-delete violating comments.

### 2.7 Media Upload (UC12, FR-12)
- Admin uploads team logo / player image: JPG/JPEG/PNG/WebP, ≤ 5MB, MIME validated, safe-renamed,
  stored and served; URL saved on Team/Player. Non-admin → 403 (AC-12-02).

### 2.8 Admin Dashboard (FR-09)
- Counts: users, active matches, teams, comments, predictions; recent activity.

## 3. Out of scope
End-user prediction/comment submission, public match/stat views, chatbot, auth/login (other
features). Live api-football scheduling is deferred; sync exposed as a manual-trigger service
stub (credentials server-side only).

## 4. Acceptance Criteria (traced)
AC-06-01/02/03, AC-07-01/02/03, AC-12-01/02/03, AC-13-01/02/03, AC-14-01/02/03 (notifications
produced by scoring/cancel); plus admin-only RBAC returns 403 for non-admin on every endpoint.

## 5. Key entities
`Team, Player, Match, PredictionCriterion, Prediction, MatchParticipation, Comment, User,
Notification` (see `backend/prisma/schema.prisma`). No schema change required — the schema
already models gold-per-match, participations and notifications.

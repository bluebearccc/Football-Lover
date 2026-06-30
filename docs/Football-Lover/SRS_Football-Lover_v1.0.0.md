# Software Requirements Specification (SRS)

**Project:** Football-Lover  
**Version:** v1.1.0  
**Standard:** IEEE-style SRS  
**Status:** Updated from confirmed stakeholder decisions  
**Date:** 2026-06-20

> Diagrams are stored as external PlantUML `.puml` files under [`./diagrams/`](./diagrams/). No PlantUML source is embedded in this SRS.

---

# Record of Changes

| Version | Date | A/M/D | In Charge | Change Description |
|---|---|---|---|---|
| v1.0.0 | 2026-06-12 | A | SRS Agent | Initial SRS created from stakeholder-confirmed requirements after `XÁC NHẬN` |
| v1.1.0 | 2026-06-20 | M | SRS Agent | Added per-match gold mechanic (no persistent wallet), match winner by highest score (≥1), monthly win-count leaderboard, Team/Player/Notification/MatchParticipation/PasswordResetToken entities, password reset via email, api-football data sync, local CLI proxy chatbot; binary HOME/AWAY criteria (removed `options`); frontend stack → Next.js |

*A = Added, M = Modified, D = Deleted*

---

# 1. Product Overview

## 1.1 Purpose

This document specifies the software requirements for **Football-Lover**, a responsive Vietnamese web application for football fans. It captures functional requirements, user requirements, non-functional requirements, business rules, acceptance criteria, and traceability for v1.0.0.

## 1.2 Product Scope

Football-Lover allows users to view football match data/statistics and participate in a playful prediction/evaluation experience. In each match, users can choose which team wins each prediction criterion. The system stores matches, criteria, predictions, comments, statistics, user history, and related media such as team/player images.

This is a new system built from scratch. There is no legacy replacement or migration requirement.

### In scope for v1.0.0

- Account registration and login/logout.
- Public match list and match detail viewing.
- Prediction/evaluation by registered users.
- Admin match/result management and prediction criteria management.
- Comments, statistics, monthly win-count leaderboard, user profile/history.
- Per-match gold pool with winner payout (no persistent gold wallet).
- Win/lose in-app notifications.
- Team management and scraped player data; Admin upload of team/player images.
- Chatbot for authenticated users (served via a local CLI proxy).
- api-football.com data sync; password reset via an email provider.

### Out of scope for v1.0.0

- Native iOS/Android apps.
- Desktop app.
- Payment/paid subscriptions; real-money handling (gold is a non-monetary score settled offline by users).
- Email service beyond password reset (no marketing/notification emails).
- Excel/PDF import/export.
- Multi-language UI.
- Formal ISO 27001/SOC 2/PCI-DSS certification.
- Backup/disaster recovery, by stakeholder decision.

## 1.3 Target Users

| # | Actor | Description |
|---:|---|---|
| 1 | Guest | Can view public matches, public statistics, public comments, and register an account. |
| 2 | Registered User | Can login, predict/evaluate criteria, comment, view statistics, view own profile/history, and use chatbot. |
| 3 | Admin | Can manage users, matches, criteria, results, media uploads, and moderation. |

## 1.4 System Diagrams

- [Context Diagram](./diagrams/context-diagram.puml)
- [System Overview](./diagrams/system-overview.puml)
- [Entity Relationship Diagram](./diagrams/entity-relationship.puml)
- [Layered Architecture](./diagrams/layered-architecture.puml)
- [Deployment Diagram](./diagrams/deployment.puml)
- [Integration Diagram](./diagrams/integration.puml)
- [System Screen Flow](./diagrams/screen-flow.puml)

---

# 2. User Requirements

## 2.1 Actors and Permissions

| Actor | Allowed | Not Allowed | Approval Required |
|---|---|---|---|
| Admin | Manage users; create/edit/delete matches; manage prediction criteria; update official results; upload team/player images; view all data; moderate comments | Should not manipulate finalized prediction results in a way that breaks fairness | No |
| Registered User | Register/login/logout; view matches; submit/edit predictions before deadline; comment; view statistics; view own profile/history; use chatbot | Cannot manage system-wide users/matches; cannot edit others' data; cannot use Admin functions | No |
| Guest | View public match list, public match statistics, statistics/leaderboards, public comments; register account | Cannot predict/evaluate, comment, use chatbot, or view own profile | No |

## 2.2 Use Cases

| UC ID | Use Case | Primary Actor | Priority | Diagram Folder |
|---|---|---|---|---|
| UC01 | Register Account | Guest | Must | [uc-01](./diagrams/uc-01/) |
| UC02 | Login/Logout | Registered User/Admin | Must | [uc-02](./diagrams/uc-02/) |
| UC03 | View Match List | Guest/User/Admin | Must | [uc-03](./diagrams/uc-03/) |
| UC04 | View Match Details | Guest/User/Admin | Must | [uc-04](./diagrams/uc-04/) |
| UC05 | Submit/Edit Prediction/Evaluation | Registered User | Must | [uc-05](./diagrams/uc-05/) |
| UC06 | Manage Matches | Admin | Must | [uc-06](./diagrams/uc-06/) |
| UC07 | Manage Prediction Criteria | Admin | Must | [uc-07](./diagrams/uc-07/) |
| UC08 | Comment on Match | Registered User | Should | [uc-08](./diagrams/uc-08/) |
| UC09 | View Statistics/Leaderboard | Guest/User/Admin | Should | [uc-09](./diagrams/uc-09/) |
| UC10 | View Profile and Prediction History | Registered User/Admin | Should | [uc-10](./diagrams/uc-10/) |
| UC11 | Use Chatbot | Registered User | Could | [uc-11](./diagrams/uc-11/) |
| UC12 | Upload Team/Player Images | Admin | Supporting | [uc-12](./diagrams/uc-12/) |
| UC13 | Manage Teams (and scraped players) | Admin | Must | _(diagrams TBD)_ |
| UC14 | View Win/Lose Notifications | Registered User | Should | _(diagrams TBD)_ |
| UC15 | Reset Password via Email | Registered User/Admin | Should | _(diagrams TBD)_ |

> **Gold mechanic** is part of UC05 (join match via prediction) and UC06 (Admin sets `entry_gold`,
> system computes the pool and payout on Finished). See FR-15 and BR26–BR30.

### UC01 — Register Account

**Diagrams:** [Use Case](./diagrams/uc-01/uc-01-use-case.puml), [Screen Flow](./diagrams/uc-01/uc-01-screenflow.puml), [State](./diagrams/uc-01/uc-01-statediagram.puml), [Sequence](./diagrams/uc-01/uc-01-sequence.puml), [Backend Class](./diagrams/uc-01/uc-01-class-backend.puml), [Frontend Class](./diagrams/uc-01/uc-01-class-frontend.puml)

| Item | Description |
|---|---|
| Primary Actor | Guest |
| Trigger | Guest chooses to create an account. |
| Preconditions | Guest is not logged in. |
| Postconditions | A new active account is created if email and password are valid. |
| Normal Flow | Guest opens registration form, enters email/display name/password, submits, system validates and creates account. |
| Exceptions | Duplicate email, invalid email, weak password, empty display name, missing required fields. |

### UC02 — Login/Logout

**Diagrams:** [Use Case](./diagrams/uc-02/uc-02-use-case.puml), [Screen Flow](./diagrams/uc-02/uc-02-screenflow.puml), [State](./diagrams/uc-02/uc-02-statediagram.puml), [Sequence](./diagrams/uc-02/uc-02-sequence.puml), [Backend Class](./diagrams/uc-02/uc-02-class-backend.puml), [Frontend Class](./diagrams/uc-02/uc-02-class-frontend.puml)

| Item | Description |
|---|---|
| Primary Actor | Registered User/Admin |
| Trigger | Actor submits login credentials or requests logout. |
| Preconditions | Account exists and is not locked. |
| Postconditions | Actor has an authenticated session or is logged out. |
| Exceptions | Wrong email/password, locked account, account not found, expired session. |

### UC03 — View Match List

**Diagrams:** [Use Case](./diagrams/uc-03/uc-03-use-case.puml), [Screen Flow](./diagrams/uc-03/uc-03-screenflow.puml), [State](./diagrams/uc-03/uc-03-statediagram.puml), [Sequence](./diagrams/uc-03/uc-03-sequence.puml), [Backend Class](./diagrams/uc-03/uc-03-class-backend.puml), [Frontend Class](./diagrams/uc-03/uc-03-class-frontend.puml)

| Item | Description |
|---|---|
| Primary Actor | Guest/User/Admin |
| Trigger | Actor opens the home/match list page. |
| Preconditions | Public match data is available or can show empty state. |
| Postconditions | Actor sees public match list or no-data message. |
| Exceptions | API error, no data. |

### UC04 — View Match Details

**Diagrams:** [Use Case](./diagrams/uc-04/uc-04-use-case.puml), [Screen Flow](./diagrams/uc-04/uc-04-screenflow.puml), [State](./diagrams/uc-04/uc-04-statediagram.puml), [Sequence](./diagrams/uc-04/uc-04-sequence.puml), [Backend Class](./diagrams/uc-04/uc-04-class-backend.puml), [Frontend Class](./diagrams/uc-04/uc-04-class-frontend.puml)

| Item | Description |
|---|---|
| Primary Actor | Guest/User/Admin |
| Trigger | Actor selects a match. |
| Preconditions | Match exists. |
| Postconditions | Actor sees match details, criteria, public statistics, and comments. |
| Exceptions | Match not found, API error. |

### UC05 — Submit/Edit Prediction/Evaluation

**Diagrams:** [Use Case](./diagrams/uc-05/uc-05-use-case.puml), [Screen Flow](./diagrams/uc-05/uc-05-screenflow.puml), [State](./diagrams/uc-05/uc-05-statediagram.puml), [Sequence](./diagrams/uc-05/uc-05-sequence.puml), [Backend Class](./diagrams/uc-05/uc-05-class-backend.puml), [Frontend Class](./diagrams/uc-05/uc-05-class-frontend.puml)

| Item | Description |
|---|---|
| Primary Actor | Registered User |
| Trigger | User submits or edits predictions for match criteria. |
| Preconditions | User is logged in; match status is SCHEDULED (kickoff/`match_time` not reached). |
| Postconditions | Prediction is saved/updated, statistics refreshed; submitting at least one prediction makes the user a participant of the match (joins the gold pool). |
| Exceptions | Not logged in, match not SCHEDULED (LIVE/FINISHED/CANCELLED), already predicted that criterion, invalid prediction. |
| Notes | Each correct criterion later scores +1 (BR12). Gold is per-match: payout is computed on Finished (BR26–BR28); no gold is deducted to join. |

### UC06 — Manage Matches

**Diagrams:** [Use Case](./diagrams/uc-06/uc-06-use-case.puml), [Screen Flow](./diagrams/uc-06/uc-06-screenflow.puml), [State](./diagrams/uc-06/uc-06-statediagram.puml), [Sequence](./diagrams/uc-06/uc-06-sequence.puml), [Backend Class](./diagrams/uc-06/uc-06-class-backend.puml), [Frontend Class](./diagrams/uc-06/uc-06-class-frontend.puml)

| Item | Description |
|---|---|
| Primary Actor | Admin |
| Trigger | Admin creates/edits/cancels a match, sets `entry_gold`, or updates official result and per-criterion results. |
| Preconditions | Admin is authenticated and authorized. |
| Postconditions | Match data is saved; on Finished the system scores predictions, computes the gold pool/payout, records MatchParticipation, and sends win/lose notifications. |
| Exceptions | Non-Admin access, invalid match, same teams, started/finished match edit, deleting match with related data. |
| Notes | `entry_gold` defaults to 100; pool = entry_gold × participants; result of each criterion (`result_team`) is entered by Admin and/or scraped from api-football (BR12, BR26–BR30). |

### UC07 — Manage Prediction Criteria

**Diagrams:** [Use Case](./diagrams/uc-07/uc-07-use-case.puml), [Screen Flow](./diagrams/uc-07/uc-07-screenflow.puml), [State](./diagrams/uc-07/uc-07-statediagram.puml), [Sequence](./diagrams/uc-07/uc-07-sequence.puml), [Backend Class](./diagrams/uc-07/uc-07-class-backend.puml), [Frontend Class](./diagrams/uc-07/uc-07-class-frontend.puml)

| Item | Description |
|---|---|
| Primary Actor | Admin |
| Trigger | Admin creates/edits/deactivates criteria for a match. |
| Preconditions | Admin is authorized; match is editable. |
| Postconditions | Prediction criteria are available for users before deadline. |
| Exceptions | Non-Admin access, invalid criterion, locked match. |

### UC08 — Comment on Match

**Diagrams:** [Use Case](./diagrams/uc-08/uc-08-use-case.puml), [Screen Flow](./diagrams/uc-08/uc-08-screenflow.puml), [State](./diagrams/uc-08/uc-08-statediagram.puml), [Sequence](./diagrams/uc-08/uc-08-sequence.puml), [Backend Class](./diagrams/uc-08/uc-08-class-backend.puml), [Frontend Class](./diagrams/uc-08/uc-08-class-frontend.puml)

| Item | Description |
|---|---|
| Primary Actor | Registered User |
| Trigger | User submits a comment under a match. |
| Preconditions | User is logged in and match exists. |
| Postconditions | Comment is published if valid. |
| Exceptions | Guest access, empty/too long comment, spam, banned words, match not found. |

### UC09 — View Statistics/Leaderboard

**Diagrams:** [Use Case](./diagrams/uc-09/uc-09-use-case.puml), [Screen Flow](./diagrams/uc-09/uc-09-screenflow.puml), [State](./diagrams/uc-09/uc-09-statediagram.puml), [Sequence](./diagrams/uc-09/uc-09-sequence.puml), [Backend Class](./diagrams/uc-09/uc-09-class-backend.puml), [Frontend Class](./diagrams/uc-09/uc-09-class-frontend.puml)

| Item | Description |
|---|---|
| Primary Actor | Guest/User/Admin |
| Trigger | Actor opens statistics or leaderboard. |
| Preconditions | Statistics exist or empty state is allowed. |
| Postconditions | Actor sees prediction totals, leaderboard, or no-data message. |
| Exceptions | No statistics data, API error. |

### UC10 — View Profile and Prediction History

**Diagrams:** [Use Case](./diagrams/uc-10/uc-10-use-case.puml), [Screen Flow](./diagrams/uc-10/uc-10-screenflow.puml), [State](./diagrams/uc-10/uc-10-statediagram.puml), [Sequence](./diagrams/uc-10/uc-10-sequence.puml), [Backend Class](./diagrams/uc-10/uc-10-class-backend.puml), [Frontend Class](./diagrams/uc-10/uc-10-class-frontend.puml)

| Item | Description |
|---|---|
| Primary Actor | Registered User/Admin |
| Trigger | User opens own profile/history; Admin views for support if authorized. |
| Preconditions | Actor is authenticated. |
| Postconditions | Profile and prediction history are displayed. |
| Exceptions | Not logged in, profile not found, unauthorized access. |

### UC11 — Use Chatbot

**Diagrams:** [Use Case](./diagrams/uc-11/uc-11-use-case.puml), [Screen Flow](./diagrams/uc-11/uc-11-screenflow.puml), [State](./diagrams/uc-11/uc-11-statediagram.puml), [Sequence](./diagrams/uc-11/uc-11-sequence.puml), [Backend Class](./diagrams/uc-11/uc-11-class-backend.puml), [Frontend Class](./diagrams/uc-11/uc-11-class-frontend.puml)

| Item | Description |
|---|---|
| Primary Actor | Registered User |
| Trigger | User asks chatbot a question. |
| Preconditions | User is authenticated. |
| Postconditions | Chatbot returns read-only answer or temporary unavailable message. |
| Exceptions | Not logged in, question too long, too many requests, request to modify data, provider unavailable. |

### UC12 — Upload Team/Player Images

**Diagrams:** [Use Case](./diagrams/uc-12/uc-12-use-case.puml), [Screen Flow](./diagrams/uc-12/uc-12-screenflow.puml), [State](./diagrams/uc-12/uc-12-statediagram.puml), [Sequence](./diagrams/uc-12/uc-12-sequence.puml), [Backend Class](./diagrams/uc-12/uc-12-class-backend.puml), [Frontend Class](./diagrams/uc-12/uc-12-class-frontend.puml)

| Item | Description |
|---|---|
| Primary Actor | Admin |
| Trigger | Admin uploads team logo/image or player image. |
| Preconditions | Admin is authenticated and file is selected. |
| Postconditions | File is stored, URL/path is saved, and image is publicly viewable. |
| Exceptions | Non-Admin access, invalid file type, file > 5MB, storage failure. |

### UC13 — Manage Teams (and scraped players)

| Item | Description |
|---|---|
| Primary Actor | Admin |
| Trigger | Admin creates/edits/deactivates a team, or refreshes team/player data from api-football. |
| Preconditions | Admin is authenticated and authorized. |
| Postconditions | Team (and its players) are stored; teams are selectable when creating matches; missing images fall back to a default image. |
| Exceptions | Non-Admin access, duplicate team, deleting a team referenced by a match (deactivate instead), sync/provider error. |

### UC14 — View Win/Lose Notifications

| Item | Description |
|---|---|
| Primary Actor | Registered User |
| Trigger | A match the user participated in becomes Finished or Cancelled; user opens notifications. |
| Preconditions | User is authenticated and participated in the match. |
| Postconditions | User sees MATCH_WON / MATCH_LOST / MATCH_CANCELLED notifications and can mark them read. |
| Exceptions | Not logged in, no notifications. |

### UC15 — Reset Password via Email

| Item | Description |
|---|---|
| Primary Actor | Registered User/Admin |
| Trigger | User requests a password reset from the login page. |
| Preconditions | Account exists with the given email. |
| Postconditions | A single-use, time-limited reset token is emailed; using a valid token sets a new password. |
| Exceptions | Email not found (respond neutrally), expired/used token, weak new password. |

## 2.3 Acceptance Criteria per Use Case

### UC01 — Register Account
- **AC-01-01:** Given Guest is on registration page, When valid email/display name/password are submitted, Then account is created successfully.
- **AC-01-02:** Given an email already exists, When Guest submits registration, Then system rejects the request with duplicate email message.
- **AC-01-03:** Given password is shorter than 8 characters or lacks letters/numbers, When Guest submits registration, Then system blocks submission and shows password policy error.

### UC02 — Login/Logout
- **AC-02-01:** Given an active account, When correct email/password are submitted, Then a session/token is created.
- **AC-02-02:** Given wrong credentials, When login is submitted, Then system shows a safe error without revealing which field is wrong.
- **AC-02-03:** Given a logged-in user, When logout is requested, Then session/token is cleared.

### UC03 — View Match List
- **AC-03-01:** Given public matches exist, When actor opens match list, Then match cards/list are displayed.
- **AC-03-02:** Given no matches exist, When actor opens match list, Then empty state is displayed.
- **AC-03-03:** Given match API fails, When actor opens match list, Then a retry/try-later error is displayed.

### UC04 — View Match Details
- **AC-04-01:** Given a match exists, When actor opens details, Then teams, time, status, criteria, statistics, and comments are displayed.
- **AC-04-02:** Given actor is Guest, When viewing details, Then prediction/comment actions are not available.
- **AC-04-03:** Given match ID is invalid, When actor opens details, Then not-found message is displayed.

### UC05 — Submit/Edit Prediction/Evaluation
- **AC-05-01:** Given user is logged in and deadline not passed, When user submits valid predictions, Then predictions are saved and statistics update.
- **AC-05-02:** Given user has already predicted but deadline not passed, When user edits prediction, Then prediction is updated.
- **AC-05-03:** Given deadline passed or match started/cancelled, When user submits/edits, Then system blocks the action.
- **AC-05-04:** Given a user submits at least one prediction, When the match later becomes Finished, Then the user is a participant whose score = number of correct criteria and is included in the gold pool.

### UC06 — Manage Matches
- **AC-06-01:** Given Admin is logged in, When valid match data is submitted, Then match is created/updated.
- **AC-06-02:** Given home and away teams are identical, When Admin saves match, Then system rejects it.
- **AC-06-03:** Given match has related predictions/comments/statistics, When Admin deletes it, Then system rejects hard delete or changes status to Cancelled.

### UC07 — Manage Prediction Criteria
- **AC-07-01:** Given Admin is logged in and match is editable, When valid criterion is saved, Then criterion becomes available.
- **AC-07-02:** Given criterion data is invalid, When Admin saves, Then validation error is shown.
- **AC-07-03:** Given match is locked/started, When Admin edits criterion, Then system blocks edit if it would affect fairness.

### UC08 — Comment on Match
- **AC-08-01:** Given user is logged in and comment valid, When user submits comment, Then comment appears under match.
- **AC-08-02:** Given Guest attempts to comment, When comment is submitted, Then login is required.
- **AC-08-03:** Given comment is empty/too long/spam, When submitted, Then system rejects it with clear message.

### UC09 — View Statistics/Leaderboard
- **AC-09-01:** Given statistics exist, When actor opens statistics, Then prediction counts by match/criterion are shown.
- **AC-09-02:** Given users have won matches this calendar month, When actor opens leaderboard, Then users are ranked by number of matches won in the current month (Asia/Ho_Chi_Minh); only matches with ≥ 2 participants count.
- **AC-09-03:** Given no statistics exist, When actor opens statistics, Then no-data message is shown.

### UC10 — View Profile and Prediction History
- **AC-10-01:** Given user is logged in, When opening own profile (`/profile`), Then display name, email, join date, all-time points, current-month rank, and stats (matches played, matches won, accuracy, total gold won) are shown.
- **AC-10-02:** Given session expired, When user opens `/profile` or `/history`, Then system redirects to login.
- **AC-10-03:** Given a non-Admin user, When the user requests another user's profile/history, Then the request is denied (self-service endpoints only accept the authenticated caller's own id; there is no client-facing route to pass another user's id).
- **AC-10-04:** Given an Admin is authenticated, When the Admin opens a user's profile/history from the admin user-management screen for support, Then the same profile/stats/history data is returned for that target user (read-only).
- **AC-10-05:** Given the user has no finished-match participations yet, When opening `/profile` or `/history`, Then an empty-state message is shown instead of an error.

### UC11 — Use Chatbot
- **AC-11-01:** Given user is logged in, When asking about match/stat/rules/own history, Then chatbot returns a read-only answer.
- **AC-11-02:** Given Guest opens chatbot, When chatbot is used, Then login is required.
- **AC-11-03:** Given provider timeout/unavailable, When user asks a question, Then system shows chatbot unavailable/try-later message.

### UC12 — Upload Team/Player Images
- **AC-12-01:** Given Admin uploads JPG/JPEG/PNG/WebP <= 5MB, When upload succeeds, Then URL/path is stored and image can be viewed publicly.
- **AC-12-02:** Given non-Admin tries to upload, When upload endpoint is accessed, Then system returns 403 Forbidden.
- **AC-12-03:** Given invalid format or file > 5MB, When Admin uploads, Then system rejects and shows clear error.

### UC13 — Manage Teams
- **AC-13-01:** Given Admin is logged in, When a valid team is created, Then it becomes selectable as home/away when creating a match.
- **AC-13-02:** Given a team is referenced by a match, When Admin deletes it, Then hard delete is rejected and the team is deactivated instead.
- **AC-13-03:** Given a team/player has no image, When it is displayed, Then a default image is shown.

### UC14 — Win/Lose Notifications
- **AC-14-01:** Given a match becomes Finished, When scoring completes, Then each participant receives a MATCH_WON or MATCH_LOST notification.
- **AC-14-02:** Given a match becomes Cancelled, When the status changes, Then each participant receives a MATCH_CANCELLED notification and that match's results are voided.
- **AC-14-03:** Given a user has notifications, When the user marks one read, Then its read state is persisted.

### UC15 — Reset Password via Email
- **AC-15-01:** Given an existing email, When the user requests a reset, Then a single-use, time-limited token is emailed.
- **AC-15-02:** Given a valid unexpired token and a policy-compliant new password, When submitted, Then the password is updated and the token is consumed.
- **AC-15-03:** Given an expired or already-used token, When submitted, Then the system rejects it with a clear message.

### Gold mechanic (cross-cutting, BR26–BR30)
- **AC-GOLD-01:** Given a Finished match with ≥ 2 participants, When scoring runs, Then pool = entry_gold × participants and is split equally among winners (highest score, score ≥ 1), with gold_won shown to 2 decimal places.
- **AC-GOLD-02:** Given the highest score in a match is 0, When scoring runs, Then there is no winner and the pool is void.
- **AC-GOLD-03:** Given a match has exactly 1 participant, When scoring runs, Then that user may be marked winner but the win does not count toward the leaderboard.

---

# 3. Software Features

## 3.1 Functional Requirements Overview

| FR ID | Feature | Priority | Related UC |
|---|---|---|---|
| FR-01 | Account registration with unique email and password validation | Must | UC01 |
| FR-02 | Login/logout with session/token expiration | Must | UC02 |
| FR-03 | Public match list browsing | Must | UC03 |
| FR-04 | Match detail viewing with criteria, public stats, comments | Must | UC04 |
| FR-05 | Submit/edit prediction/evaluation before deadline | Must | UC05 |
| FR-06 | Admin match/result management and scoring trigger | Must | UC06 |
| FR-07 | Admin prediction criteria management | Must | UC07 |
| FR-08 | Registered-user comments with moderation/anti-spam | Should | UC08 |
| FR-09 | Statistics, monthly win-count leaderboard, and Admin dashboard metrics | Should | UC09 |
| FR-10 | Profile and prediction history | Should | UC10 |
| FR-11 | Authenticated read-only chatbot (local CLI proxy) | Could | UC11 |
| FR-12 | Admin upload for team/player images | Supporting | UC12 |
| FR-13 | api-football scheduled/manual sync | Supporting | UC06, UC03, UC04, UC13 |
| FR-14 | Team management and scraped player data | Must | UC13 |
| FR-15 | Per-match gold pool, winner determination, and payout | Must | UC05, UC06 |
| FR-16 | Win/lose in-app notifications | Should | UC14 |
| FR-17 | Password reset via email | Should | UC15 |

## 3.2 Feature Details

### FR-01 Account Registration
- The system shall allow Guests to register with email, display name, and password.
- The system shall reject duplicate email addresses.
- The system shall enforce password policy: minimum 8 characters with letters and numbers.

### FR-02 Authentication
- The system shall authenticate User/Admin with email and password.
- The system shall store passwords only as secure hashes.
- The system shall expire sessions/tokens and require login again after expiration.

### FR-03 Match List
- The system shall display a public match list to Guest/User/Admin.
- The system shall support empty state and error state.

### FR-04 Match Details
- The system shall display match teams, time, status, scores, prediction criteria, statistics, and comments.
- Guest can view public details but cannot predict or comment.

### FR-05 Prediction/Evaluation
- The system shall allow registered users to select one of the two teams (HOME/AWAY) for each criterion.
- The system shall enforce one prediction per (user, criterion).
- The system shall allow edit while match status is SCHEDULED.
- The system shall lock predictions when the match starts (status leaves SCHEDULED at `match_time`).
- The system shall hide others' predictions before match starts and make them public after match starts.
- Submitting at least one prediction registers the user as a participant of that match's gold pool.

### FR-06 Match Management
- Admin shall create, edit, cancel, and update match official results, and set `entry_gold` (default 100).
- Matches reference `Team` records for home/away (not free-text).
- The system shall validate home/away team (must differ), match time, status, score, and non-negative `entry_gold`.
- Admin shall set each criterion's `result_team`; results may also be scraped from api-football, with Admin data taking priority.
- Reaching Finished shall trigger scoring, gold payout, MatchParticipation records, and notifications (idempotent — runs once per match).
- Cancelling a match shall void its participation results and send MATCH_CANCELLED notifications.

### FR-07 Prediction Criteria Management
- Admin shall create/edit/deactivate criteria per match.
- The system shall prevent changes that affect fairness after match lock.

### FR-08 Comments
- Registered users shall comment under matches.
- The system shall validate non-empty content, maximum length, spam frequency, banned words, and match existence.
- Admin can hide/delete violating or spam comments.

### FR-09 Statistics/Leaderboard
- The system shall update prediction statistics when predictions are submitted.
- The system shall rank users by **number of matches won within the current calendar month** (Asia/Ho_Chi_Minh); only matches with ≥ 2 participants count.
- Admin dashboard shall show system counts and activity metrics.

### FR-10 Profile/History
- Registered users shall view own profile and prediction history.
- Admin can view user history for support/moderation when authorized.
- Profile screen (`/profile`) shows: account info (display name, email, join date), all-time points (tiebreak counter), current calendar-month leaderboard rank, stats (total matches participated, total matches won, prediction accuracy %, total gold won across finished matches), and the 5 most recent finished-match results.
- History screen (`/history`) shows the full, paginated list of finished matches the user participated in (teams, final score, number of correct criteria, gold won). Only matches that have been scored (status `FINISHED`) appear — `MatchParticipation` rows are created exclusively at scoring time.
- Admin support view reuses the same profile/stats/history data for a target user, exposed under the admin user-management surface (`ADMIN` role required); it does not create a separate data shape.

### FR-11 Chatbot
- Only authenticated users can use chatbot.
- Chatbot can answer match/stat questions, suggest matches/criteria, explain rules, and answer own profile/history questions.
- Chatbot is read-only and cannot modify data.
- Chatbot is served through a **local CLI proxy** (no hosted third-party provider in v1.1.0); the proxy endpoint/secret is server-side only.

### FR-12 Media Upload
- Admin can upload team logos/images and player images.
- Allowed formats: JPG, JPEG, PNG, WebP.
- Maximum size: 5MB per file.
- System validates MIME type, safe-renames files, stores URL/path, and blocks executable files.

### FR-13 External Football Data Sync
- The system integrates with **api-football.com** via REST JSON.
- Scheduled/manual pull every 15–30 minutes is supported for schedule/scores, plus `start_date`/`end_date`, team and player data.
- External records map to local rows via `external_id` on Team/Player/Match.
- If external data conflicts with Admin-edited data, Admin data is prioritized or Admin confirmation is required before overwrite.

### FR-14 Team & Player Management
- Admin shall create/edit/deactivate teams; players are primarily synced from api-football.
- Team `logo_url` and Player `image_url` are optional; when missing, a default image is shown.
- A team referenced by any match cannot be hard-deleted (deactivate instead).

### FR-15 Gold Pool & Winner Payout
- Gold is **per-match only**; there is no persistent user gold wallet.
- Each match has `entry_gold` (default 100); a participant is any user with ≥ 1 prediction on the match.
- On Finished: pool = `entry_gold` × number of participants.
- Winner(s) = participant(s) with the highest score, where score = number of correct criteria and must be ≥ 1.
- `gold_won` = pool ÷ number of winners, recorded on MatchParticipation and displayed to 2 decimal places.
- If the highest score is 0, there is no winner and the pool is void.
- A match with < 2 participants does not contribute to the leaderboard.
- Gold is a non-monetary score; real settlement happens offline between users.

### FR-16 Notifications
- On Finished, the system notifies each participant MATCH_WON or MATCH_LOST; on Cancelled, MATCH_CANCELLED.
- Notifications are in-app, have a read/unread state, and link to the related match.

### FR-17 Password Reset
- Users can request a password reset by email.
- The system emails a single-use, time-limited token and never reveals whether an email exists.
- A valid token allows setting a new policy-compliant password; expired/used tokens are rejected.

---

# 4. Non-Functional Requirements

## 4.1 Performance Requirements

| Operation | Acceptable | Ideal | Measurement |
|---|---:|---:|---|
| Page load web/mobile | < 3s | < 1.5s | P95 |
| Normal API call | < 1s | < 300ms | P95 |
| Match list/details | < 2s | < 800ms | P95 |
| Submit prediction/evaluation | < 1s | < 500ms | P95 |
| Submit comment | < 1s | < 500ms | P95 |
| Statistics/leaderboard | < 2s | < 1s | P95 |
| Chatbot response | < 5s | < 3s | P95, provider-dependent |
| Upload image/logo/player | < 5s/file 5MB | < 3s/file 5MB | P95 |

## 4.2 Scalability and Capacity

- Initial registered users: approximately 100.
- Initial matches: at least 50.
- Prediction volume: 5–10 predictions/user/month, around 5 criteria/match.
- Comments: 10–20 comments/match.
- Chatbot usage: 3–5 messages/user/day for active users.
- Average concurrent users: 5–20; peak concurrent users: 20–50.
- Growth: 10–20%/month for users, matches, predictions, and comments.
- Initial scale: vertical or one app instance; design should allow horizontal scaling later.
- Recommended indexes: match_time, status, user_id, match_id, criterion_id.
- Statistics caching may be added if load increases.

## 4.3 Availability and Reliability

- Uptime target: 99% for v1.0.0.
- Planned maintenance should occur outside peak hours, preferably at night in Asia/Ho_Chi_Minh.
- Planned maintenance should be announced beforehand.
- Emergency maintenance is allowed for critical issues affecting login, prediction, match data, or security.
- Short downtime is acceptable in v1.0.0.

## 4.4 Backup and Recovery

- Stakeholder explicitly selected **no backup** for v1.0.0.
- No complex disaster recovery is required in v1.0.0.
- Stakeholder accepts risk of losing user, match, prediction, comment, statistic, chatbot conversation, and uploaded image data if a serious database/storage incident occurs.
- This is a documented accepted risk and conflicts with the earlier preference that downtime should not lose user/prediction/comment data.

## 4.5 Security Requirements

- Authentication: email + password for User/Admin.
- Password: minimum 8 characters, letters and numbers.
- Passwords must be stored as secure hashes; no plaintext passwords.
- Sessions/auth tokens must expire; expired session redirects to login.
- RBAC roles: Guest, Registered User, Admin.
- Only Admin can manage matches, criteria, results, and uploads.
- 2FA is not mandatory in v1.0.0.
- Accounts can be locked by Admin or due to violations.
- Do not log password, token, API key, or sensitive secrets.
- Chatbot can only answer data of the authenticated user and cannot modify data.
- Local CLI proxy endpoint/secret, api-football API key, and email provider credentials must be server-side only.
- Password-reset tokens are single-use and time-limited; only their hash is stored, never the raw token.

## 4.6 Privacy, Compliance, and Data Classification

- Apply basic personal data protection principles in Vietnam context.
- No ISO 27001/SOC 2/PCI-DSS certification required in v1.0.0.
- Payment/PCI does not apply.
- Basic Terms of Use/Privacy Policy notice is required during registration.
- Users can view own personal information and prediction history; edit/delete account requests may be handled by Admin.

| Classification | Data Examples | Protection |
|---|---|---|
| Public | Match list, public stats, leaderboard, public comments, team/player images/logos | Visible to Guest/User/Admin |
| Internal | System config, sync status, non-secret technical logs | Admin/Developer access only |
| Confidential | User email/profile, pre-public prediction history, personal chatbot history | Own user and authorized Admin only |
| Restricted | Password hash, session token, external API keys/tokens | Server-side secret handling, no logs, no client exposure |

## 4.7 UI/UX, Accessibility, and Localization

- Platforms: desktop/laptop web browser 60%, mobile web 40%.
- No native apps in v1.0.0.
- Responsive breakpoints: 480px, 768px, 1024px, 1440px.
- Touch targets should be at least 44x44px.
- Statistics tables may scroll horizontally or use card layout on mobile.
- Basic WCAG 2.1 AA: contrast, keyboard navigation for forms/buttons, alt text for team/player images/logos.
- UI style: sporty, fun, easy to use.
- Dark mode is not mandatory in v1.0.0.
- Vietnamese only; Vietnam date/time format; timezone Asia/Ho_Chi_Minh.

## 4.8 Logging, Monitoring, and Operations

### Logging/Audit

- Authentication logs: user, IP, time, success/fail, logout, session expiration; retention 6 months.
- Authorization logs: user, action, resource, allow/deny, 403; retention 6 months.
- User actions: prediction changes, comment actions, own profile view; retention 6–12 months.
- Admin actions: match/criteria/result updates, image uploads, account locking; retention 12 months.
- System/API events: server errors, timeouts, Football Data API sync, Chatbot Provider errors; retention 3–6 months.
- Security events: repeated failed login, comment spam, unauthorized access, suspicious requests; retention 12 months.
- Use structured JSON logs if possible and correlation/request IDs.

### Monitoring/Alerting

- Uptime monitoring for website/API.
- Application monitoring: server errors, response time, API timeout.
- Database monitoring: connection and basic slow queries.
- External API monitoring: Football Data API and Chatbot Provider errors/timeouts.
- File upload error monitoring.
- Alert conditions: website down, high 500 errors, repeated timeouts, DB errors, prolonged provider errors.
- Alert channel: Email/Telegram/Discord or simple log dashboard depending on implementation.
- Business metrics tracked: registrations, matches, predictions, comments.

### Deployment/Infrastructure

- Hosting: Cloud/VPS or simple hosting server.
- Region: Vietnam or Singapore preferred.
- Environments: Development, Staging, Production.
- Compute: one web/app server initially; Docker optional.
- Database: relational database.
- File storage: server storage or object storage; store URL/path in DB.
- CI/CD: GitHub Actions/GitLab CI or manual deploy acceptable.
- Deployment: rolling/simple restart; rollback by previous release.
- Secrets: environment variables/server-side config.

### Operations/Support

- Support channel: simple contact form or Admin-provided channel.
- Support scope: login, prediction, match info, comments, chatbot, statistics display errors.
- Admin operations: manage users, lock violating accounts, edit matches, update results, inspect spam comments.
- Incident handling: Admin/Dev checks logs, posts maintenance notice if needed, deploys fix.
- Content moderation: Admin can hide/delete violating or spam comments.
- User guidance: rule/how-to-predict guide and basic FAQ.
- Support SLA: best-effort, no official response commitment in v1.0.0.

---

# 5. Requirement Appendix

## 5.1 Business Rules

| Rule ID | Rule | Description |
|---|---|---|
| BR01 | Email duy nhất | One email can register only one account. |
| BR02 | Mật khẩu hợp lệ | Password must meet minimum policy. |
| BR03 | Chỉ thành viên được dự đoán | Guests cannot submit predictions. |
| BR04 | Chốt dự đoán | Prediction creation/editing is locked after deadline or match start. |
| BR05 | Mỗi người chỉ dự đoán một lần cho mỗi trận | Duplicate new prediction per user/match is rejected. |
| BR06 | Cho phép sửa trước deadline | Users can edit predictions before lock. |
| BR07 | Trận đấu phải hợp lệ | Match must have home team, away team, and match time. |
| BR08 | Hai đội không được trùng nhau | Home and away teams cannot be identical. |
| BR09 | Không sửa trận đã bắt đầu | Core match info cannot be edited after start. |
| BR10 | Chỉ Admin quản lý trận đấu | Match management requires Admin role. |
| BR11 | Chỉ Admin cập nhật kết quả | Official result update requires Admin role. |
| BR12 | Tính điểm mỗi tiêu chí (+1) | On Finished, each user's score = number of criteria where selected_team == result_team (+1 each). |
| BR13 | Chỉ tính điểm khi có kết quả chính thức | Scoring starts only from official result. |
| BR14 | Trận bị hủy không tính điểm | Cancelled match predictions do not count. |
| BR15 | Chỉ thành viên được bình luận | Guests cannot submit comments. |
| BR16 | Không cho phép bình luận rỗng | Empty comments are rejected. |
| BR17 | Chống spam bình luận | Repeated comments are rate-limited. |
| BR18 | Bình luận phải thuộc một trận đấu | Comment must attach to Match ID. |
| BR19 | Cập nhật thống kê dự đoán | New prediction updates vote statistics. |
| BR20 | Xếp hạng theo số trận thắng trong tháng | Leaderboard ranks users by number of matches won within the current calendar month (Asia/Ho_Chi_Minh). |
| BR21 | Không xem dự đoán của người khác trước giờ thi đấu | Others' predictions are hidden before match starts. |
| BR22 | Công khai dự đoán sau khi trận bắt đầu | Predictions become visible after match starts. |
| BR23 | Không xóa trận đã có dữ liệu liên quan | Reject hard delete or switch to Cancelled. |
| BR24 | Chỉ thành viên đăng nhập được sử dụng chatbot | Chatbot requires authentication. |
| BR25 | Chatbot chỉ được phép tra cứu thông tin | Chatbot is read-only and cannot modify data. |
| BR26 | Pool gold theo trận | Pool = entry_gold × số người tham gia; entry_gold mặc định 100; không có ví gold tích lũy (chỉ tính trong trận). |
| BR27 | Người thắng = điểm cao nhất | Người thắng là người có score cao nhất và score ≥ 1; hòa thì nhiều người cùng thắng. |
| BR28 | Chia pool cho người thắng | gold_won = pool ÷ số người thắng, hiển thị 2 chữ số thập phân; nếu điểm cao nhất = 0 thì không có người thắng, pool bị hủy. |
| BR29 | Tối thiểu người tham gia cho leaderboard | Trận thắng chỉ tính vào leaderboard khi trận có ≥ 2 người tham gia. |
| BR30 | Thông báo thắng/thua/hủy | Finished → MATCH_WON/MATCH_LOST cho từng người tham gia; Cancelled → MATCH_CANCELLED và hủy toàn bộ kết quả trận. |
| BR31 | Token reset mật khẩu hết hạn | Email token dùng-một-lần, có thời hạn; từ chối token đã hết hạn/đã dùng. |

## 5.2 Data Requirements

| Entity | Primary Fields |
|---|---|
| User | id, email, password_hash, display_name, role, status, total_points, created_at |
| Team | id, name, short_name, logo_url, external_id, created_at |
| Player | id, team_id, name, position, image_url, external_id, created_at |
| Match | id, home_team_id, away_team_id, match_time, start_date, end_date, status, home_score, away_score, entry_gold, external_id, created_at |
| PredictionCriterion | id, match_id, name, description, result_team, resolved_at, source |
| Prediction | id, user_id, match_id, criterion_id, selected_team, is_correct, created_at, updated_at |
| MatchParticipation | id, match_id, user_id, score, is_winner, gold_won, created_at |
| Comment | id, match_id, user_id, content, created_at, status |
| Statistic | id, match_id, criterion_id, total_home_votes, total_away_votes |
| Notification | id, user_id, type, title, body, match_id, is_read, created_at |
| ChatbotConversation | id, user_id, message, response, created_at |
| PasswordResetToken | id, user_id, token_hash, expires_at, used_at, created_at |

Key constraints: `unique(User.email)`, `unique(Prediction: user_id + criterion_id)`,
`unique(MatchParticipation: match_id + user_id)`, `Match.home_team_id != away_team_id`,
`Match.entry_gold >= 0`. `gold_won` is `Decimal(12,2)`; `entry_gold` is `Decimal(12,2)`.

### Enumerations

| Enum | Values |
|---|---|
| User.role | USER, ADMIN |
| User.status | ACTIVE, LOCKED |
| Match.status | SCHEDULED, LIVE, FINISHED, CANCELLED, POSTPONED |
| PredictionCriterion.result_team | HOME, AWAY (null until resolved) |
| PredictionCriterion.source | MANUAL, SCRAPED |
| Prediction.selected_team | HOME, AWAY |
| Comment.status | VISIBLE, HIDDEN, DELETED |
| Notification.type | MATCH_WON, MATCH_LOST, MATCH_CANCELLED |

### Validation limits

- `display_name`: 2–50 characters.
- `Comment.content`: 1–1000 characters (non-empty after trim).
- Comment anti-spam: max 5 comments/minute/user, minimum 10 seconds between comments (else HTTP 429).
- Chatbot message: max 500 characters.
- Banned-word list: configurable, empty by default in v1.1.0.

Relationships are shown in [Entity Relationship Diagram](./diagrams/entity-relationship.puml).

## 5.3 Application Messages List

| Message Type | Example Message |
|---|---|
| Validation | Email không hợp lệ; mật khẩu phải có ít nhất 8 ký tự, gồm chữ và số. |
| Duplicate | Email đã tồn tại. |
| Authentication | Email hoặc mật khẩu không đúng; phiên đăng nhập đã hết hạn. |
| Authorization | Bạn không có quyền thực hiện thao tác này. |
| Prediction Lock | Dự đoán đã bị khóa do quá hạn hoặc trận đã bắt đầu. |
| Upload | File không đúng định dạng hoặc vượt quá dung lượng 5MB. |
| Chatbot | Chatbot tạm thời không khả dụng, vui lòng thử lại sau. |
| External API | Chưa có dữ liệu mới, vui lòng thử lại sau. |
| Notification (Win) | Bạn đã THẮNG trận {home} vs {away} và nhận {gold} gold. |
| Notification (Lose) | Bạn đã thua trận {home} vs {away}. |
| Notification (Cancel) | Trận {home} vs {away} đã bị hủy, kết quả không được tính. |
| Password Reset | Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu. |
| System | Có lỗi xảy ra, vui lòng thử lại sau. |

## 5.4 Acceptance and Project Timeline

### Acceptance / Sign-off

- No business KPI metrics are required.
- All Must Have features are completed.
- Business rules BR01–BR25 work correctly.
- UAT flows pass: registration, login, view matches, prediction, comments, statistics, manage matches/criteria/results, image upload, chatbot.
- No critical bug remains affecting login, prediction, match data, authorization, or security.
- SRS and diagrams are complete.

### Timeline

| Phase | Deliverables | Duration |
|---|---|---|
| 1. Requirements & SRS | Interview, requirements-summary, SRS, diagrams | 1 week |
| 2. UI/UX & Architecture | UI/UX, architecture, DB/API design | 1–2 weeks |
| 3. Development MVP | Must Have features | 3–5 weeks |
| 4. Extended Development | Comments, statistics, profile/history, uploads, chatbot | 2–3 weeks |
| 5. Testing & UAT | Test BR01–BR25, bug fixes | 1–2 weeks |
| 6. Go-live | Production deployment and guidance | 1 week |

Total expected duration: 9–14 weeks.

## 5.5 Requirements Traceability Index (RTI)

| FR ID | Feature | UC | Priority | Status |
|---|---|---|---|---|
| FR-01 | Account registration | UC01 | Must | Draft |
| FR-02 | Login/logout | UC02 | Must | Draft |
| FR-03 | View match list | UC03 | Must | Draft |
| FR-04 | View match details | UC04 | Must | Draft |
| FR-05 | Submit/edit prediction/evaluation | UC05 | Must | Draft |
| FR-06 | Manage matches/results | UC06 | Must | Draft |
| FR-07 | Manage prediction criteria | UC07 | Must | Draft |
| FR-08 | Comment on match | UC08 | Should | Draft |
| FR-09 | Statistics + monthly win-count leaderboard | UC09 | Should | Draft |
| FR-10 | View profile/history | UC10 | Should | Draft |
| FR-11 | Use chatbot (local CLI proxy) | UC11 | Could | Draft |
| FR-12 | Upload team/player images | UC12 | Supporting | Draft |
| FR-13 | api-football sync | UC06, UC03, UC04, UC13 | Supporting | Draft |
| FR-14 | Team & player management | UC13 | Must | Draft |
| FR-15 | Per-match gold pool & payout | UC05, UC06 | Must | Draft |
| FR-16 | Win/lose notifications | UC14 | Should | Draft |
| FR-17 | Password reset via email | UC15 | Should | Draft |

---

# Appendix A — External Diagram Index

For full diagram index, see [`./diagrams/README.md`](./diagrams/README.md).

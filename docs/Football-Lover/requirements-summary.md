# Football-Lover — Requirements Summary

| Field | Value |
|---|---|
| Project Name | Football-Lover |
| Version | v1.1.0 |
| Status | Confirmed |
| Confirmation | User typed `XÁC NHẬN` after completing 35/35 interview questions |
| Date | 2026-06-12 (v1.0.0); updated 2026-06-20 (v1.1.0) |

> **v1.1.0 changes (2026-06-20):** added gold mechanic (per-match, no persistent wallet),
> match winner by highest score, monthly win-count leaderboard, Team/Player/Notification
> entities, password reset via email provider, api-football data sync, local CLI proxy
> chatbot. Frontend stack changed to **Next.js**.

## 1. Project Overview

Football-Lover is a Vietnamese responsive web application for football fans. It stores match data/statistics and creates a playful community experience where registered users can join matches by predicting/evaluating criteria between two teams.

The system is built from scratch. There is no legacy system and no data migration requirement.

### Business problem/opportunity
- Users lack a website to follow match statistics and play/predict together.
- The system provides a central place to store match data and encourage user interaction.
- No business KPI is required for success measurement; functional acceptance criteria are used instead.

## 2. Actors and Permissions

| Actor | Allowed | Not Allowed | Approval Required |
|---|---|---|---|
| Admin | Manage users; create/edit/delete matches; manage prediction criteria; update official results; upload team/player images; view all data; moderate comments | Should not manipulate finalized prediction results in a way that breaks fairness | No |
| Registered User | Register/login/logout; view matches; submit/edit predictions before deadline; comment; view statistics; view own profile/history; use chatbot | Cannot manage system-wide users/matches; cannot edit others' data; cannot use Admin functions | No |
| Guest | View public match list, public match statistics, statistics/leaderboards, public comments; register account | Cannot predict/evaluate, comment, use chatbot, or view own profile | No |

## 3. Features and MoSCoW Priorities

| # | Feature | Main Actor | Priority |
|---:|---|---|---|
| 1 | Register account | Guest | Must |
| 2 | Login/Logout | Registered User/Admin | Must |
| 3 | View match list | Guest/User/Admin | Must |
| 4 | View match details, public statistics, criteria and comments | Guest/User/Admin | Must |
| 5 | Submit/edit prediction/evaluation criteria | Registered User | Must |
| 6 | Manage matches and official results | Admin | Must |
| 7 | Manage prediction criteria | Admin | Must |
| 8 | Comment on match | Registered User | Should |
| 9 | View statistics and leaderboard | Guest/User/Admin | Should |
| 10 | View profile and prediction history | Registered User/Admin | Should |
| 11 | Use chatbot | Registered User | Could |
| 12 | Upload team/player images | Admin | Supporting requirement |
| 13 | Manage teams (and scraped players) | Admin | Must |
| 14 | Per-match gold pool and winner payout | User/System | Must |
| 15 | Win/lose notifications | Registered User | Should |
| 16 | Password reset via email | Registered User/Admin | Should |

## 4. Identified Use Cases

| UC ID | Use Case | Primary Actor | Coverage |
|---|---|---|---|
| UC01 | Register Account | Guest | Feature 1, BR01-BR02 |
| UC02 | Login/Logout | Registered User/Admin | Feature 2 |
| UC03 | View Match List | Guest/User/Admin | Feature 3 |
| UC04 | View Match Details | Guest/User/Admin | Feature 4 |
| UC05 | Submit/Edit Prediction/Evaluation | Registered User | Feature 5, BR03-BR06, BR12-BR14, BR21-BR22 |
| UC06 | Manage Matches | Admin | Feature 6, BR07-BR11, BR23 |
| UC07 | Manage Prediction Criteria | Admin | Feature 7 |
| UC08 | Comment on Match | Registered User | Feature 8, BR15-BR18 |
| UC09 | View Statistics/Leaderboard | Guest/User/Admin | Feature 9, BR19-BR20 |
| UC10 | View Profile and Prediction History | Registered User/Admin | Feature 10 |
| UC11 | Use Chatbot | Registered User | Feature 11, BR24-BR25 |
| UC12 | Upload Team/Player Images | Admin | File upload requirement |

## 5. Business Rules

| Rule ID | Rule | Trigger | Action |
|---|---|---|---|
| BR01 | One email can register only one account | User registers | Check uniqueness; reject if existing |
| BR02 | Password must satisfy minimum policy | Register/change password | Show validation error if not satisfied |
| BR03 | Only members can predict | User submits prediction | Require login |
| BR04 | Prediction lock | Deadline reached or match starts | Lock create/edit prediction |
| BR05 | One prediction per user per match | User submits prediction | Reject new duplicate prediction |
| BR06 | Allow edit before deadline | User updates prediction | Update if deadline not passed |
| BR07 | Match must be valid | Admin creates match | Validate home team, away team, match time |
| BR08 | Two teams must not be identical | Admin creates/edits match | Reject save |
| BR09 | Started match core information cannot be edited | Admin edits match | Block core field edits |
| BR10 | Only Admin manages matches | User accesses management | Check permission |
| BR11 | Only Admin updates official results | User updates result | Allow Admin only |
| BR12 | Score each prediction (+1 per correct criterion) | Match becomes Finished | For each user, score = number of criteria predicted correctly (selected_team == result_team) |
| BR13 | Score only with official result | Admin updates official result | Start scoring workflow |
| BR14 | Cancelled match does not count points | Match becomes Cancelled | Cancel prediction results for that match |
| BR15 | Only members can comment | User submits comment | Require login |
| BR16 | Empty comments are not allowed | User submits comment | Reject and show error |
| BR17 | Anti-spam comments | User comments repeatedly | Rate-limit comments |
| BR18 | Comment must belong to a match | User submits comment | Attach comment to Match ID |
| BR19 | Update prediction statistics | New prediction submitted | Update statistics automatically |
| BR20 | Rank by monthly win count | Match finished | Leaderboard ranks users by number of matches won within the current calendar month (timezone Asia/Ho_Chi_Minh) |
| BR21 | Hide others' predictions before kickoff | User views predictions | Hide other users' predictions |
| BR22 | Public predictions after match starts | Match starts/ends | Show all predictions |
| BR23 | Do not delete match with related data | Admin deletes match | Reject delete or switch to Cancelled |
| BR24 | Only logged-in members can use chatbot | User opens chatbot | Check authentication |
| BR25 | Chatbot is read-only | User asks chatbot | Return information only; do not modify data |
| BR26 | Per-match gold pool | Match becomes Finished | Pool = entry_gold × number of participants; entry_gold default 100; no persistent user wallet (per-match only) |
| BR27 | Match winner = highest score | Match becomes Finished | Winner(s) = participant(s) with the highest score, and score must be ≥ 1; ties → multiple winners share the pool |
| BR28 | Split pool among winners | Match becomes Finished | gold_won = pool ÷ number of winners, displayed to 2 decimal places; if highest score = 0, no winner and pool is void |
| BR29 | Minimum participants for leaderboard | Match becomes Finished | A win counts toward the leaderboard only if the match had ≥ 2 participants |
| BR30 | Win/lose notification | Match becomes Finished / Cancelled | Notify each participant MATCH_WON / MATCH_LOST; on Cancelled, notify MATCH_CANCELLED and void all participation results |
| BR31 | Password reset token expires | User requests reset | Email a single-use token with expiry; reject expired/used tokens |

## 6. Validation and Error Handling

| Area | Validation/Error Cases | Handling |
|---|---|---|
| Registration | Invalid email, duplicate email, password < 8 chars, password lacks letters/numbers, empty display name, missing fields | Show clear validation messages and block submit |
| Login | Wrong email/password, locked account, account not found | Show safe error; do not reveal sensitive details |
| Match management | Empty home/away team, same teams, invalid match time/status, started/finished match edit | Reject save or block edit |
| Result update | Negative score | Reject and show error |
| Prediction | Not logged in, deadline passed, already predicted, invalid criterion/team, cancelled match | Require login or reject with clear error |
| Comments | Not logged in, empty content, too long, spam, banned words, match not found | Require login, reject, rate-limit, or moderate |
| Profile/statistics | Profile not found, no statistics | Show appropriate empty/not-found message |
| Chatbot | Not logged in, question too long, too many requests, request to modify data, provider unavailable | Require login, rate-limit, deny write request, show unavailable message |
| Authorization | Missing Admin permission | HTTP 403 / Forbidden message |
| System/network | HTTP 400/404/500, expired session, network disconnected, API timeout | Show server message/not found/retry later; redirect to login on expired session |

Retry is allowed for temporary network loss and API timeout. Retry is not allowed for invalid input or 401/403; user must correct input, login, or contact Admin.

## 7. Reporting and Statistics

| Report/Statistic | Viewers | Update Frequency | Export |
|---|---|---|---|
| Admin Dashboard | Admin only | Real-time or when data changes | Not required |
| Prediction count by match/criterion | Guest/User/Admin | When a new prediction is submitted | Not required |
| User leaderboard by monthly win count | Guest/User/Admin | After match result and scoring | Not required |
| Stored match count | Admin | Real-time or daily | Not required |
| Registered/active user count | Admin | Real-time or daily | Not required |
| User prediction history | Own user; Admin can view all | When prediction is created/updated or scored | Not required |

## 8. Data Entities and Relationships

### Entities

| Entity | Key Fields | Managed By |
|---|---|---|
| User | id, email, password_hash, display_name, role, status, total_points, created_at | Admin/User |
| Team | id, name, short_name, logo_url, external_id, created_at | Admin/System |
| Player | id, team_id, name, position, image_url, external_id, created_at | Admin/System |
| Match | id, home_team_id, away_team_id, match_time, start_date, end_date, status, home_score, away_score, entry_gold, external_id, created_at | Admin/System |
| PredictionCriterion | id, match_id, name, description, result_team, resolved_at, source | Admin/System |
| Prediction | id, user_id, match_id, criterion_id, selected_team, is_correct, created_at, updated_at | User/System |
| MatchParticipation | id, match_id, user_id, score, is_winner, gold_won, created_at | System |
| Comment | id, match_id, user_id, content, created_at, status | User/Admin |
| Statistic | id, match_id, criterion_id, total_home_votes, total_away_votes | System |
| Notification | id, user_id, type, title, body, match_id, is_read, created_at | System |
| ChatbotConversation | id, user_id, message, response, created_at | System |
| PasswordResetToken | id, user_id, token_hash, expires_at, used_at, created_at | System |

> Note: `User` has **no gold balance** — gold is computed per match and stored on
> `MatchParticipation.gold_won`. `selected_team`/`result_team` are binary (HOME/AWAY),
> so `PredictionCriterion.options` was removed. `home_team`/`away_team` are now FKs to `Team`.

### Relationships

- Team 1:N Player
- Team 1:N Match (as home), 1:N Match (as away)
- User 1:N Prediction
- User 1:N Comment
- User 1:N ChatbotConversation
- User 1:N MatchParticipation
- User 1:N Notification
- User 1:N PasswordResetToken
- Match 1:N PredictionCriterion
- Match 1:N Prediction
- Match 1:N MatchParticipation
- PredictionCriterion 1:N Prediction
- Match 1:N Comment
- Match 1:N Statistic
- Match 1:N Notification
- PredictionCriterion 1:1 or 1:N Statistic

### Data lifecycle rules
- Do not hard-delete Match if it has Prediction/Comment/Statistic/MatchParticipation; use Cancelled or soft delete.
- Do not hard-delete a Team referenced by any Match; deactivate instead.
- User can be locked instead of deleted if they have prediction/comment data.
- Prediction, Comment, MatchParticipation, Notification, and ChatbotConversation should keep timestamps for audit.
- Gold is per-match only: it is recorded on MatchParticipation.gold_won and is not accumulated on User.
- Cancelled match: void all MatchParticipation results (scores/winners/gold) and send MATCH_CANCELLED notifications.

## 9. Integrations and Sync

| Integration | Purpose | Method | Data Flow | Provider |
|---|---|---|---|---|
| Chatbot/AI Provider | Answer match/stat questions, suggest matches/criteria, explain rules, answer own history/profile questions | Local CLI proxy | Bidirectional request/response | **Local CLI proxy** (chạy ở local) |
| Football Data API | Sync match/team/player/schedule/official score data | REST JSON | Pull | **api-football.com** |
| Email Provider | Send password-reset emails | SMTP/API | Push | Configurable (e.g. SMTP/transactional email) |

- **Email service is required in v1.1.0** (only for password reset). General notifications are in-app, not email.
- API keys/bearer tokens are stored server-side.
- Football Data API (api-football.com) sync: scheduled + manual refresh, every 15–30 minutes for schedule/scores;
  also used to scrape `start_date`/`end_date`, team and player data; Admin can refresh and override manually.
- Chatbot is served via a **local CLI proxy** rather than a hosted provider.
- If API data conflicts with Admin-edited data, prioritize Admin data or require Admin confirmation before overwrite.
- Chatbot calls are on-demand and real-time for authenticated users only.

## 10. File Upload Requirements

| Type | Who Can Upload/Manage | Formats | Max Size | Handling |
|---|---|---|---|---|
| Team logos/images | Admin only | JPG, JPEG, PNG, WebP | 5MB/file | MIME validation, safe rename, store URL/path, block executable files |
| Player images | Admin only | JPG, JPEG, PNG, WebP | 5MB/file | MIME validation, resize/compress if needed, link to team/player |

Guest/User can only view public images. Excel/PDF import/export is not required in v1.0.0.

## 11. UI/UX, Platform, and Localization

- Platform: Web Browser 60%, Mobile Web 40%.
- No native iOS/Android app, desktop app, or external API consumers in v1.0.0.
- Responsive desktop/mobile web with breakpoints 480px, 768px, 1024px, 1440px.
- Mobile UX: minimum 44x44px touch targets; statistics tables can scroll horizontally or become cards.
- Accessibility: basic WCAG 2.1 AA, contrast, keyboard navigation for forms/buttons, alt text for team/player images/logos.
- UI style: sporty, fun, easy to use; Tailwind/Bootstrap/custom design system acceptable.
- Dark mode is not mandatory in v1.0.0.
- Vietnamese only; date/time format for Vietnam; timezone Asia/Ho_Chi_Minh.

## 12. Non-Functional Requirements

### Performance

| Operation | Acceptable | Ideal | Measurement |
|---|---:|---:|---|
| Page load web/mobile | < 3s | < 1.5s | P95 |
| Normal API call | < 1s | < 300ms | P95 |
| Match list/details | < 2s | < 800ms | P95 |
| Submit prediction/evaluation | < 1s | < 500ms | P95 |
| Submit comment | < 1s | < 500ms | P95 |
| Statistics/leaderboard | < 2s | < 1s | P95 |
| Chatbot response | < 5s | < 3s | P95, provider-dependent |
| Upload image/logo/player | < 5s per 5MB | < 3s per 5MB | P95 |

### Scalability and capacity
- Initial users: ~100 registered users.
- Initial matches: at least 50 matches.
- Predictions: 5–10 predictions/user/month, around 5 criteria/match.
- Comments: 10–20 comments/match.
- Chatbot usage: 3–5 messages/user/day for active users.
- Average concurrent users: 5–20; peak: 20–50.
- Growth: 10–20%/month for users, matches, predictions, comments.
- Initial scaling can be vertical or one app instance; design should allow horizontal scaling later.
- Database indexes: match_time, status, user_id, match_id, criterion_id; caching for statistics if load increases.

### Availability and backup/risk
- Uptime target: 99% for v1.0.0.
- Planned maintenance outside peak hours, preferably at night in Asia/Ho_Chi_Minh.
- Prior notice for planned maintenance.
- Emergency maintenance allowed for critical login, prediction, match data, or security issues.
- Stakeholder explicitly chose no backup in v1.0.0 and accepts risk of data loss during serious database/storage incidents. This conflicts with the preference to avoid data loss and is recorded as an accepted risk.

### Security, compliance, privacy
- Email + password authentication for User/Admin.
- Password policy: minimum 8 characters, letters and numbers.
- Passwords stored as secure hash; never plaintext.
- Session/auth token has expiration; expired session requires login.
- RBAC: Guest/User/Admin.
- 2FA is not mandatory in v1.0.0.
- Accounts can be locked by Admin or due to violations.
- Do not log passwords/tokens; API keys stored server-side.
- Basic Vietnam-context personal data protection principles; no ISO 27001/SOC 2/PCI-DSS in v1.0.0.
- Basic Terms of Use/Privacy Policy notice during registration.

### Data classification
- Public: match list, public stats, leaderboards, public comments, team/player images/logos.
- Internal: system config, sync status, technical logs without secrets.
- Confidential: user email/profile, prediction history before public time, personal chatbot history.
- Restricted: password hash, session token, external API keys/tokens.

### Logging, deployment, monitoring, operations
- Logs: authentication, authorization, user actions, Admin actions, system/API events, security events.
- Use structured JSON logs if possible, request/correlation ID, no sensitive data in logs.
- Hosting: Cloud/VPS or simple hosting server; region Vietnam or Singapore.
- Environments: Development, Staging, Production.
- Database: relational database. File storage: server storage or object storage.
- CI/CD: GitHub Actions/GitLab CI or manual deploy acceptable.
- Monitoring: uptime, application errors, DB connection/slow queries, external API errors/timeouts, upload errors, business metrics.
- Support: simple contact form or Admin channel; best-effort support, no official response SLA.

## 13. Acceptance Criteria and Timeline

### Functional acceptance/sign-off
- No business KPI/success metrics required.
- All Must Have features completed.
- BR01–BR25 work correctly.
- UAT flows pass: registration, login, view matches, prediction, comments, statistics, manage matches/criteria/results, image upload, chatbot.
- No critical bugs affecting login, prediction, match data, authorization, or security.
- SRS and diagrams complete after requirements confirmation.

### Timeline

| Phase | Deliverables | Duration |
|---|---|---|
| 1. Requirements & SRS | Interview, requirements-summary, SRS, diagrams | 1 week |
| 2. UI/UX & Architecture | UI design, architecture, DB/API design | 1–2 weeks |
| 3. Development MVP | Must Have features | 3–5 weeks |
| 4. Extended Development | Comments, statistics, profile/history, upload images, chatbot | 2–3 weeks |
| 5. Testing & UAT | Functional testing, BR01–BR25 testing, bug fixes | 1–2 weeks |
| 6. Go-live | Production deploy, monitoring/logging check, usage guidance | 1 week |

Total expected duration: 9–14 weeks.

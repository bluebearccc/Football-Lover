# Football-Lover — Feature Tracker

| # | Feature | UC liên quan | Priority | Status | Spec | Plan | Tasks |
|---|---------|-------------|----------|--------|------|------|-------|
| 001 | [user-auth](001-user-auth/spec.md) | UC01, UC02, UC15 | Must | ✔️ Done & verified | ✅ | ✅ | ✅ |
| 002 | [team-management](002-team-management/spec.md) | UC13, UC12 | Must | ✔️ Done & verified | ✅ | ✅ | ✅ |
| 003 | [match-management](003-match-management/spec.md) | UC06 | Must | ✔️ Done & verified | ✅ | ✅ | ✅ |
| 004 | [match-viewing](004-match-viewing/spec.md) | UC03, UC04 | Must | ✔️ Done & verified | ✅ | ✅ | ✅ |
| 005 | [prediction-criteria](005-prediction-criteria/spec.md) | UC05, UC07 | Must | ✔️ Done & verified | ✅ | ✅ | ✅ |
| 006 | [gold-scoring](006-gold-scoring/spec.md) | BR26–BR29 | Must | ✔️ Done & verified | ✅ | ✅ | ✅ |
| 007 | [match-comments](007-match-comments/spec.md) | UC08 | Should | ✔️ Done & verified | ✅ | ✅ | ✅ |
| 008 | [stats-leaderboard](008-stats-leaderboard/spec.md) | UC09 | Should | ✔️ Done & verified | ✅ | ✅ | ✅ |
| 009 | [notifications](009-notifications/spec.md) | UC14 | Should | ✔️ Done & verified | ✅ | ✅ | ✅ |
| 010 | [chatbot](010-chatbot/spec.md) | UC11 | Could | ✔️ Done & verified | ✅ | ✅ | ✅ |
| 011 | [admin-dashboard](011-admin-dashboard/spec.md) | UC17 | Should | ✔️ Done & verified | ✅ | ✅ | ✅ |
| 012 | [manage-users](012-manage-users/spec.md) | UC16 | Should | ✔️ Done & verified | ✅ | ✅ | ✅ |
| 013 | [user-profile-history](../docs/Football-Lover/SRS_Football-Lover_v1.0.0.md#uc10--view-profile-and-prediction-history) | UC10 | Should | ✔️ Done & verified | n/a¹ | n/a¹ | n/a¹ |

¹ Built directly against SRS UC10 (no `/speckit.specify` spec-kit folder) — see `docs/Football-Lover/SRS_Football-Lover_v1.0.0.md` AC-10-01..05 and `diagrams/uc-10/`. Two pages share this one UC/feature: `/profile` (overview — info, stats, current-month rank, 5 most recent results) and `/history` (full paginated match history). Backend: `backend/src/modules/profile/` (`GET /profile/me`, `GET /profile/history`) + Admin support view in `modules/users` (`GET /admin/users/:id/profile|history`). Frontend: `frontend/src/app/(main)/profile/`, `.../history/`, shared component `components/profile/MatchHistoryList.tsx`.

All rows above reconciled against `git log` (merged PRs #1–#11) and the presence of `specs/0XX-*/{spec,plan,tasks}.md` — every feature 001–012 has a merged implementation commit; nothing in this tracker is still "Not started".

## Dependency Graph

```
auth ──→ team-management ──→ match-management ──→ match-viewing
                                                ──→ prediction-criteria ──→ gold-scoring ──→ stats-leaderboard
                                                                                         ──→ user-profile-history (stats + lịch sử trận: trận thắng, accuracy, gold)
                                                                                         ──→ notifications
auth ──→ comments (sau khi có match-viewing)
auth ──→ chatbot (độc lập, làm cuối)
auth ──→ admin-dashboard (sau khi có match-management, gold-scoring, comments)
auth ──→ manage-users (độc lập, chỉ cần auth)
```

Tất cả nhánh trên đã hoàn thành (xem bảng trạng thái phía trên).

## Status Legend

| Icon | Meaning |
|------|---------|
| ⬜ | Not started |
| 📝 | Spec in progress |
| ✅ | Phase complete |
| 🚧 | Implementing |
| ✔️ | Done & verified |

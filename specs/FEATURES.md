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
| 008 | stats-leaderboard | UC09, UC10 | Should | ⬜ Not started | — | — | — |
| 009 | notifications | UC14 | Should | ⬜ Not started | — | — | — |
| 010 | chatbot | UC11 | Could | ⬜ Not started | — | — | — |

## Dependency Graph

```
auth ──→ team-management ──→ match-management ──→ match-viewing
                                                ──→ prediction-criteria ──→ gold-scoring ──→ stats-leaderboard
                                                                                         ──→ notifications
auth ──→ comments (sau khi có match-viewing)
auth ──→ chatbot (độc lập, làm cuối)
```

## Status Legend

| Icon | Meaning |
|------|---------|
| ⬜ | Not started |
| 📝 | Spec in progress |
| ✅ | Phase complete |
| 🚧 | Implementing |
| ✔️ | Done & verified |

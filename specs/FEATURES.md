# Football-Lover — Feature Tracker

| # | Feature | UC liên quan | Priority | Status | Spec | Plan | Tasks |
|---|---------|-------------|----------|--------|------|------|-------|
| 001 | [user-auth](001-user-auth/spec.md) | UC01, UC02, UC15 | Must | ✔️ Done & verified | ✅ | ✅ | ✅ |
| 002 | [team-management](002-team-management/spec.md) | UC13, UC12 | Must | 🚧 Implementing | ✅ | ✅ | ✅ |
| 003 | [match-management](003-match-management/spec.md) | UC06 | Must | ✔️ Done & verified | ✅ | ✅ | ✅ |
| 004 | match-viewing | UC03, UC04 | Must | ⬜ Not started | — | — | — |
| 005 | prediction-criteria | UC05, UC07 | Must | ⬜ Not started | — | — | — |
| 006 | gold-scoring | BR26–BR29 | Must | ⬜ Not started | — | — | — |
| 007 | comments | UC08 | Should | ⬜ Not started | — | — | — |
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

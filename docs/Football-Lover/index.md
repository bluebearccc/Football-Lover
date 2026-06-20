# Football-Lover Documentation Index

| Artifact | Path |
|---|---|
| Requirements Summary | [requirements-summary.md](./requirements-summary.md) |
| SRS v1.0.0 | [SRS_Football-Lover_v1.0.0.md](./SRS_Football-Lover_v1.0.0.md) |
| Diagram Index | [diagrams/README.md](./diagrams/README.md) |

## System-level diagrams

- [Context Diagram](./diagrams/context-diagram.puml)
- [System Overview](./diagrams/system-overview.puml)
- [Entity Relationship](./diagrams/entity-relationship.puml)
- [Layered Architecture](./diagrams/layered-architecture.puml)
- [Deployment](./diagrams/deployment.puml)
- [Integration](./diagrams/integration.puml)
- [Screen Flow](./diagrams/screen-flow.puml)

## Use cases

| UC | Name | Diagram folder |
|---|---|---|
| UC01 | Register Account | [uc-01](./diagrams/uc-01/) |
| UC02 | Login/Logout | [uc-02](./diagrams/uc-02/) |
| UC03 | View Match List | [uc-03](./diagrams/uc-03/) |
| UC04 | View Match Details | [uc-04](./diagrams/uc-04/) |
| UC05 | Submit/Edit Prediction/Evaluation | [uc-05](./diagrams/uc-05/) |
| UC06 | Manage Matches | [uc-06](./diagrams/uc-06/) |
| UC07 | Manage Prediction Criteria | [uc-07](./diagrams/uc-07/) |
| UC08 | Comment on Match | [uc-08](./diagrams/uc-08/) |
| UC09 | View Statistics/Leaderboard | [uc-09](./diagrams/uc-09/) |
| UC10 | View Profile and Prediction History | [uc-10](./diagrams/uc-10/) |
| UC11 | Use Chatbot | [uc-11](./diagrams/uc-11/) |
| UC12 | Upload Team/Player Images | [uc-12](./diagrams/uc-12/) |
| UC13 | Manage Teams (and scraped players) | [uc-13](./diagrams/uc-13/) |
| UC14 | View Win/Lose Notifications | [uc-14](./diagrams/uc-14/) |
| UC15 | Reset Password via Email | [uc-15](./diagrams/uc-15/) |

Each use case folder contains:

- `uc-XX-use-case.puml`
- `uc-XX-screenflow.puml`
- `uc-XX-statediagram.puml`
- `uc-XX-sequence.puml`
- `uc-XX-class-backend.puml`
- `uc-XX-class-frontend.puml`

## Notes

- Requirements were confirmed by stakeholder with `XÁC NHẬN`.
- Stakeholder chose no backup for v1.0.0 and accepted the data-loss risk.
- **v1.1.0 (2026-06-20):** added per-match gold mechanic, monthly win-count leaderboard,
  Team/Player/Notification entities, password reset via email, api-football sync, local CLI
  proxy chatbot; frontend → Next.js. UC13–UC15 diagrams added; UC05/UC06 class+sequence+state
  diagrams updated for gold scoring, payout, and notifications.

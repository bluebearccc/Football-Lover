# Research: Team Management (UC13)

## R1: api-football.com Integration for Teams & Players

**Decision**: Use the `/v3/teams` and `/v3/players/squads` endpoints from api-football.com, filtered by league ID.

**Rationale**: The `/v3/teams?league={id}&season={year}` endpoint returns all teams in a specific league/season, which aligns with the clarified requirement of league-filtered sync. The `/v3/players/squads?team={id}` endpoint returns the full squad for a team. Both endpoints return `team.id` / `player.id` as external identifiers for upsert mapping.

**Alternatives considered**:
- `/v3/teams?search={name}` — per-team search would require N+1 calls and doesn't support bulk sync.
- Scheduled polling — rejected for now; Admin-triggered blocking sync is simpler and matches the clarified UX requirement.

**Key integration details**:
- Base URL: `https://v3.football.api-sports.io` (or `https://api-football-v1.p.rapidapi.com`)
- Auth header: `x-apisports-key: {API_FOOTBALL_KEY}`
- Rate limit: 10 requests/minute on free plan, 300/minute on paid
- Response shape: `{ response: [{ team: { id, name, code, logo, ... }, venue: {...} }] }`
- Player squad shape: `{ response: [{ team: {...}, players: [{ id, name, position, photo }] }] }`

## R2: Admin-Data Conflict Resolution Strategy

**Decision**: Track which fields have been manually edited via a `manuallyEdited` flag or by comparing `externalId` presence. During sync, skip updating any team that was manually created (no `externalId`) or whose Admin-edited fields differ from the last known external values.

**Rationale**: The simplest approach — if a team has an `externalId`, sync can safely update `logoUrl` from the external source. If Admin has manually changed `name` or `shortName` (which are the most likely fields to edit), those fields are preserved. The practical implementation: only update fields that Admin hasn't explicitly set differently from the external source.

**Simplified approach**: For v1, sync only updates `logoUrl` and player data for teams with `externalId`. `name` and `shortName` are never overwritten once the team exists locally (Admin edits always win). New teams from external source are created with all fields.

## R3: Duplicate Team Name Validation

**Decision**: Validate uniqueness of team name among active teams only. Deactivated teams may share names with active ones.

**Rationale**: The spec says "not a duplicate of an existing active team" (FR-002). Checking only active teams avoids blocking creation when a team was deactivated and a new team with the same name needs to be created (e.g., after a club rebrand).

## R4: Existing Code Audit

**Decision**: The backend `teams` module is already 90% implemented. The frontend admin teams page has CRUD but lacks sync UI and player roster view.

**Findings**:
- `backend/src/modules/teams/` — Full CRUD + player CRUD implemented. Missing: duplicate name validation on create, sync integration.
- `backend/src/modules/sync/` — Stub only. Needs real api-football HTTP calls, league filtering, and team/player upsert logic.
- `frontend/src/app/admin/teams/page.tsx` — Team list with create/edit/deactivate/delete. Missing: sync trigger UI, league selector, player roster view within team detail.
- `frontend/src/api/admin/teams.ts` — API client covers CRUD + players. Missing: sync method.
- No frontend page/component for team detail with player roster.

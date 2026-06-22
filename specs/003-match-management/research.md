# Research: Match Management

**Date**: 2026-06-22 | **Feature**: 003-match-management

## R1: Two-step scoring validation approach

**Decision**: Add a pre-flight check in `matchesService.updateResult()` that verifies all criteria for the match have a non-null `resultTeam` before calling `scoringService.scoreMatch()`. On the frontend, check criteria results before enabling the "Chốt kết quả" button and show a warning listing unresolved criteria.

**Rationale**: This matches the clarified spec (FR-008) — Admin must enter all criterion results first, then explicitly confirm scoring. A backend guard prevents accidental scoring via direct API calls. The frontend provides a clear UX signal.

**Alternatives considered**:
- Allow partial scoring (score only resolved criteria) — rejected because it creates ambiguous winner determination and complicates re-scoring.
- Soft warning only (no backend block) — rejected because direct API access could bypass the UX warning.

## R2: Status filter implementation

**Decision**: The backend already supports `status` as a query param in `listMatchesQuerySchema`. Add a dropdown/select UI on the frontend match list page that passes the `status` param to `adminMatchesApi.list()`.

**Rationale**: Minimal change — the API contract is already complete. Only the frontend UI needs a filter control.

**Alternatives considered**:
- Multi-status filter (select multiple statuses) — deferred; single-status filter meets the spec and existing API.

## R3: Match edit form

**Decision**: Add an edit section on the match detail page (`/admin/matches/[id]`) that shows editable fields (teams, match_time, entry_gold) when the match is SCHEDULED. Use the existing `adminMatchesApi.update()` endpoint and `updateMatchSchema`.

**Rationale**: The backend endpoint (PATCH `/admin/matches/:id`) already exists with full validation (BR09 status lock, BR08 team validation). The frontend detail page just needs a form.

**Alternatives considered**:
- Inline editing on the list page — rejected because the detail page already has the full match context.
- Modal on list page — rejected for the same reason; detail page is the natural location.

## R4: Match sync from api-football (P3 — deferred)

**Decision**: The current sync service only handles teams/players. Match sync (fixtures, scores, criterion results) will be added as a separate phase after P1/P2 gaps are closed.

**Rationale**: The system is fully functional with manual match creation/scoring. api-football match sync is a "Supporting" priority per the SRS (FR-13) and adds substantial complexity (fixture mapping, score reconciliation, conflict handling).

**Alternatives considered**:
- Implement sync in this phase — deferred because P1/P2 gaps directly affect Admin workflow; sync is automation.

## R5: Sort direction support

**Decision**: Add an optional `sortOrder` param (`asc` | `desc`, default `desc`) to `listMatchesQuerySchema`. Pass it through to the repository's `orderBy`. On the frontend, add a sort toggle button.

**Rationale**: Simple addition to existing query infrastructure. Default descending (newest first) is already the current behavior.

**Alternatives considered**:
- Multi-column sorting — over-engineering for the current scale; single-column sort on match_time is sufficient.

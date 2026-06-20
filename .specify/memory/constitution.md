<!--
SYNC IMPACT REPORT
==================
Version change: (template) → 1.0.0
Bump rationale: Initial ratification of the project constitution from existing
  project conventions (CLAUDE.md, SRS v1.1.0, layered-architecture.puml). No prior
  versioned constitution existed; this establishes the baseline (MAJOR baseline = 1.0.0).

Principles defined (5):
  I.   Spec-Driven Development (NON-NEGOTIABLE)  [new]
  II.  Layered Architecture & Module Structure   [new]
  III. Contract-First APIs & Validation          [new]
  IV.  Frontend Discipline                        [new]
  V.   Quality Gates & Traceability               [new]

Added sections:
  - Technology & Integration Constraints (Section 2)
  - Development Workflow & Review Process (Section 3)
  - Governance

Removed sections: none (template placeholders fully replaced)

Templates requiring updates:
  ✅ .specify/templates/plan-template.md   — Constitution Check gate aligns (generic, no change needed)
  ✅ .specify/templates/spec-template.md   — scope/requirements alignment OK (no mandatory section added)
  ✅ .specify/templates/tasks-template.md  — task categories cover the principle-driven types
  ✅ CLAUDE.md                              — source of these principles; remains consistent

Follow-up TODOs: none. Ratification date set to 2026-06-20 (project inception per SRS v1.1.0).
-->

# Football-Lover (GoalPredict Live) Constitution

## Core Principles

### I. Spec-Driven Development (NON-NEGOTIABLE)

The specification artifacts are the single source of truth. Code MUST conform to them and
MUST NOT introduce behavior, fields, endpoints, or rules that are not traceable to a spec.

- The authoritative inputs are, in order: the SRS
  (`docs/Football-Lover/SRS_Football-Lover_v1.0.0.md`), the entity-relationship and per-UC
  class/sequence diagrams under `docs/Football-Lover/diagrams/`, the API contract
  (`docs/Football-Lover/api/openapi.yaml` when present), and the test plan
  (`docs/Football-Lover/test-plan/`).
- Coding agents MUST NOT edit anything under `docs/` — that content belongs to the document
  pipeline. A perceived gap or contradiction in the spec MUST be raised, not silently
  invented around.
- When implementing a use case, the SRS Acceptance Criteria for that UC are the definition
  of done.

**Rationale**: This repository is spec-driven by design; divergence between spec and code
destroys traceability and is the primary defect source the workflow exists to prevent.

### II. Layered Architecture & Module Structure

The backend MUST follow the layered architecture (`diagrams/layered-architecture.puml`) with
strict separation of concerns. Each domain is a self-contained module under
`backend/src/modules/<name>/`.

- A module MUST provide the standard files: `*.controller.ts`, `*.service.ts`,
  `*.repository.ts`, `*.routes.ts`, and `*.dto.ts`. The `auth/` module is the reference
  implementation.
- Controllers ONLY orchestrate request/response. Business logic lives in services. All
  database access goes through repositories (Prisma) — no Prisma calls in controllers or
  services-bypassing-repository.
- Logic MUST NOT be collapsed into the controller or otherwise flattened to skip a layer.

**Rationale**: A predictable module shape keeps the codebase navigable, testable, and
mechanically reviewable against the class diagrams.

### III. Contract-First APIs & Validation

External behavior MUST be governed by explicit contracts and validated at the boundary.

- Request payloads MUST be validated with Zod DTOs via `validateBody`; invalid input is
  rejected before reaching service logic.
- Errors MUST be raised as `ApiError` (`src/utils/ApiError.ts`), never as ad-hoc thrown
  strings or unstructured objects.
- Authentication and authorization MUST use the `authenticate` middleware and
  `requireRole('ADMIN')` for privileged operations; routes mount under `/api/v1/*`.
- Where an OpenAPI contract exists, request/response shapes MUST match it.

**Rationale**: Boundary validation and a uniform error/authz model are the system's security
and correctness perimeter; consistency here is non-negotiable for an app handling accounts.

### IV. Frontend Discipline

The frontend MUST mirror the per-UC frontend class diagrams and keep network access out of
view components.

- Components MUST follow the class diagram decomposition (e.g.
  `RegisterPage → RegisterForm → AuthApiClient`, with `ValidationMessage`).
- API calls MUST go through the `src/api/*` clients. Components MUST NOT `fetch` directly.
- Styling MUST use the **Elite Pitch** palette defined in `tailwind.config.js`. The stack is
  Next.js + TypeScript + TailwindCSS.

**Rationale**: A diagram-aligned component tree and a single API layer keep the UI traceable
to spec and prevent scattered, untestable data access.

### V. Quality Gates & Traceability

Work is not "done" until it typechecks, lints, and traces back to a requirement.

- After changes, `npm run build` (typecheck) AND `npm run lint` MUST pass in each affected
  folder (`backend/` and/or `frontend/`) before the work is reported complete.
- Every implemented behavior MUST trace to a UC / functional requirement; new modules MUST
  satisfy the 4–5 file structure of Principle II.
- Test cases in `docs/Football-Lover/test-plan/` define the expected behavior for verifying a
  UC and SHOULD be honored when implementing it.

**Rationale**: Automated gates catch regressions cheaply, and enforced traceability keeps the
spec, code, and tests in agreement.

## Technology & Integration Constraints

The stack is fixed and MUST NOT be substituted without a constitution amendment:

- **Frontend**: Next.js + TypeScript + TailwindCSS (`frontend/`).
- **Backend**: Node.js + Express + TypeScript + Prisma (`backend/`).
- **Database**: PostgreSQL; schema is `backend/prisma/schema.prisma`, derived from
  `diagrams/entity-relationship.puml`. Schema changes go through `npm run prisma:migrate`.
- **Integrations**: api-football.com (match/team/player sync), chatbot via a local CLI proxy,
  and an email provider for password reset only.

Out-of-scope items declared in the SRS (real-money handling, native/desktop apps, multi-language
UI, import/export, formal security certifications, backup/DR) MUST NOT be implemented without an
explicit spec update first.

## Development Workflow & Review Process

- Use-case implementation SHOULD be driven via `/implement-uc <UC-id>`, which reads the SRS
  and class diagrams and delegates to the `backend-dev` / `frontend-dev` agents.
- New modules MUST conform to the reference `auth/` module shape before review.
- Before reporting completion: run the build + lint gates (Principle V) in each affected
  package.
- A code review of the resulting diff (e.g. `/code-review`) SHOULD precede merge; reviewers
  verify spec conformance, layer separation, validation/error handling, and that no `docs/`
  files were modified by coding agents.

## Governance

This constitution supersedes ad-hoc practices for the Football-Lover project. The CLAUDE.md
coding guide is the runtime companion to these principles and MUST stay consistent with them.

- **Amendments** require: a written rationale, an update to this file with a version bump, and
  propagation to dependent artifacts (CLAUDE.md and the `.specify/templates/`).
- **Versioning policy** (semantic):
  - MAJOR — backward-incompatible governance or principle removal/redefinition.
  - MINOR — a new principle/section or materially expanded guidance.
  - PATCH — clarifications, wording, and non-semantic refinements.
- **Compliance review**: every change is checked against these principles during review;
  any added complexity or deviation MUST be justified in the PR/spec, or refactored to
  comply. Persistent guidance for day-to-day work lives in CLAUDE.md.

**Version**: 1.0.0 | **Ratified**: 2026-06-20 | **Last Amended**: 2026-06-20

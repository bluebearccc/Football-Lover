# Feature Specification: Match Comments (UC08)

**Feature Branch**: `007-match-comments`

**Created**: 2026-06-23

**Status**: Draft

**Input**: User description: "comments"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Submit a Comment on a Match (Priority: P1)

A logged-in user opens a match's detail page, types a comment in the comment form, and submits it. If the content is valid (non-empty, ≤ 1000 characters, not spam, no banned words), the comment appears immediately below the match.

**Why this priority**: Core feature value — without the ability to submit and see comments, the entire feature has no utility.

**Independent Test**: Navigate to any match detail page while logged in, submit a valid comment, and confirm it appears in the comment list for that match.

**Acceptance Scenarios**:

1. **Given** a registered user is logged in and a match exists, **When** the user submits a non-empty comment of ≤ 1000 characters, **Then** the comment is published and appears under the match with the user's display name and timestamp.
2. **Given** a registered user is logged in, **When** the comment content is empty or whitespace-only, **Then** the system rejects it with a clear validation message.
3. **Given** a registered user is logged in, **When** the comment exceeds 1000 characters, **Then** the system rejects it with a character-limit error message.
4. **Given** the comment contains a banned word, **When** submitted, **Then** the system rejects it with a content-policy error message.

---

### User Story 2 — View Public Comments on a Match (Priority: P1)

Any visitor (guest or logged-in user) opens a match's detail page and sees the list of published comments, including commenter display name and timestamp.

**Why this priority**: Reading comments is the most frequent interaction and is accessible to guests — it must work before moderation or submission flows matter.

**Independent Test**: Open any match detail page without logging in and verify that the published comment list is visible and correctly formatted.

**Acceptance Scenarios**:

1. **Given** a match has published comments, **When** any actor opens the match detail page, **Then** all published (non-hidden) comments are displayed with commenter name and time.
2. **Given** a match has no comments, **When** any actor opens the match detail page, **Then** an empty-state message is shown in place of the comment list.
3. **Given** a comment has been hidden by Admin, **When** any actor views the match, **Then** the hidden comment does not appear in the list.

---

### User Story 3 — Guest Blocked from Commenting (Priority: P2)

A guest user tries to submit a comment and is prompted to log in instead of being allowed to post.

**Why this priority**: BR15 enforcement — guests must never be able to post comments. Must be confirmed before any public launch.

**Independent Test**: Open a match detail page without logging in and attempt to submit a comment; verify that the action is blocked with a login prompt.

**Acceptance Scenarios**:

1. **Given** a guest is viewing a match, **When** the guest attempts to submit a comment, **Then** the system blocks submission and shows a login-required message or redirects to login.
2. **Given** a guest is viewing a match, **When** viewing the comment form area, **Then** the comment input is either hidden or disabled with a "login to comment" prompt.

---

### User Story 4 — Anti-Spam Rate Limiting (Priority: P2)

The system prevents a single user from flooding matches with rapid-fire comments by enforcing a rate limit per user per minute and a minimum interval between posts.

**Why this priority**: BR17 protection — without this, malicious or careless users can degrade the comment section quality rapidly.

**Independent Test**: Submit 6 comments within 60 seconds as the same user and confirm the 6th is rejected with an HTTP 429 / rate-limit message.

**Acceptance Scenarios**:

1. **Given** a user has submitted 5 comments within 60 seconds, **When** they attempt a 6th, **Then** the system returns a rate-limit error (429) with a retry-after hint.
2. **Given** a user submits a comment, **When** they attempt another within 10 seconds, **Then** the system rejects the second with a "wait before commenting again" message.
3. **Given** a user has been rate-limited, **When** the required cooldown passes, **Then** the user can submit successfully again.

---

### User Story 5 — Admin Moderates Comments (Priority: P3)

An Admin can hide or delete any comment that violates content policy. Hidden comments no longer appear to any actor other than, optionally, the Admin.

**Why this priority**: Moderation is required for a safe community, but the feature ships usable without it for MVP; it can be tested independently.

**Independent Test**: As Admin, hide a published comment and confirm it no longer appears to guest/user views of that match.

**Acceptance Scenarios**:

1. **Given** Admin is logged in, **When** Admin hides a published comment, **Then** that comment's status changes to Hidden and it disappears from all non-Admin views.
2. **Given** Admin is logged in, **When** Admin deletes a comment, **Then** the comment is removed from the system and no longer appears anywhere.
3. **Given** a non-Admin attempts to hide a comment, **When** the action is attempted, **Then** the system returns a forbidden error.

---

### Edge Cases

- What happens when the match referenced by a comment no longer exists or is cancelled? → Comment submission should be rejected (BR18: comment must attach to a valid Match ID).
- What happens when a comment is submitted with leading/trailing whitespace only? → Content is trimmed; if trimmed result is empty, rejected as blank (BR16).
- What happens when the banned-word list is empty (default in v1.1.0)? → No banned-word rejection occurs; other validations still apply.
- What happens if two comments are submitted simultaneously by the same user? → Rate-limit and minimum-interval checks apply per user; only the first completes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow only registered (logged-in) users to submit comments; guests are blocked (BR15).
- **FR-002**: System MUST reject comments that are empty or contain only whitespace after trimming (BR16).
- **FR-003**: System MUST reject comments whose trimmed content exceeds 1000 characters.
- **FR-004**: System MUST enforce a rate limit of 5 comments per 60-second window per user and a minimum interval of 10 seconds between consecutive comments for the same user (BR17).
- **FR-005**: System MUST validate that the target match exists before saving a comment (BR18).
- **FR-006**: System MUST validate comment content against a configurable banned-word list; matches are rejected with a content-policy message.
- **FR-007**: System MUST persist each comment with: match reference, author reference, content, status (Published/Hidden), and creation timestamp.
- **FR-008**: System MUST expose the published comment list for a given match to all actors (guests and logged-in users).
- **FR-009**: Admin MUST be able to hide or delete any comment; hidden comments MUST NOT appear in public comment lists.
- **FR-010**: System MUST display comments under the associated match detail view alongside commenter display name and formatted timestamp.

### Key Entities

- **Comment**: Belongs to one Match and one User (author). Attributes: id, match reference, author reference, content (1–1000 chars trimmed), status (Published | Hidden | Rejected), created-at timestamp.
- **Match**: The parent entity that comments attach to; must exist and be reachable.
- **User (author)**: The logged-in user who submits the comment; display name shown publicly.
- **Banned-word list**: Configurable, server-side list used by ModerationService; empty by default in v1.1.0.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A logged-in user can submit a valid comment and see it appear on the match page in under 2 seconds.
- **SC-002**: A guest attempting to comment is blocked and sees a login prompt within 1 interaction, with no comment persisted.
- **SC-003**: A rate-limited user receives a clear "too many comments" message; no extra comment is saved.
- **SC-004**: 100% of comments containing banned words are rejected before persistence.
- **SC-005**: An Admin can hide a comment and it disappears from the public view without a page reload (or within one refresh cycle).
- **SC-006**: The comment list for a match loads and renders all published comments within 1 second for up to 20 comments per match (per NFR load estimate).

## Assumptions

- Comments are displayed in chronological order (oldest first) with no pagination required for v1; matches are expected to accumulate 10–20 comments on average.
- The banned-word list is pre-configured on the server and not editable through a UI in this feature; Admin configures it via backend configuration (v1.1.0 default: empty).
- There is no edit-comment flow in this feature; a user must submit a new comment if they want to change their message.
- The match detail page (UC04) is already implemented and hosts the comment section; this feature adds the comment section to that existing page.
- Admin moderation (hide/delete) is accessible via an admin panel or direct API; a dedicated moderation UI screen is out of scope for this feature.
- Real-time comment streaming (WebSocket/SSE) is out of scope; the page refreshes or polls to show new comments.

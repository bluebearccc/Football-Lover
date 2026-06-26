# Feature Specification: Admin Dashboard

**Feature Branch**: `011-admin-dashboard`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "admin-dashboard"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Platform Overview Metrics (Priority: P1)

As an admin, I want to see key platform metrics at a glance when I open the admin dashboard so that I can quickly assess the health and activity level of the system without navigating to multiple pages.

The dashboard displays summary cards showing: total active users (with trend indicator), number of live/active predictions, total gold pool circulated on the platform, and system responsiveness status. Each metric card provides a quick visual indicator (progress bar, mini chart, or trend arrow) to communicate direction at a glance.

**Why this priority**: The overview metrics are the primary reason an admin visits the dashboard. Without these summary numbers, the dashboard has no core value proposition.

**Independent Test**: Can be fully tested by logging in as an admin, navigating to the dashboard, and verifying that each metric card displays accurate, up-to-date data pulled from the platform's actual state.

**Acceptance Scenarios**:

1. **Given** an authenticated admin user, **When** they navigate to the admin dashboard, **Then** they see four key metric cards: total active users, active predictions count, total gold pool value, and system status indicator.
2. **Given** the platform has new user registrations in the last 30 days, **When** the admin views the "Total Active Users" card, **Then** a percentage change indicator shows the trend compared to the previous period.
3. **Given** predictions exist for currently live matches, **When** the admin views the "Live Predictions" card, **Then** the count reflects the current number of predictions on matches with status "LIVE".
4. **Given** gold has been distributed across finished matches, **When** the admin views the "Total Gold Pool" card, **Then** the value reflects the sum of all gold pools with a trend indicator showing performance against historical averages.

---

### User Story 2 - Monitor Match Traffic and League Popularity (Priority: P2)

As an admin, I want to see a chart of match traffic over time and a breakdown of prediction activity by league so that I can understand which leagues drive the most engagement and when peak activity occurs.

The dashboard includes a bar chart showing prediction/match traffic over the last 24 hours (with an option for last 7 days), and a ranked list of top-performing leagues by percentage of total prediction activity, each with a visual progress bar.

**Why this priority**: Understanding traffic patterns and league popularity helps admins make informed decisions about match scheduling, content prioritization, and resource allocation.

**Independent Test**: Can be tested by verifying that the traffic chart renders with accurate time-based data and the league ranking percentages sum correctly and reflect actual prediction distribution.

**Acceptance Scenarios**:

1. **Given** an admin is on the dashboard, **When** they view the "Live Match Traffic" chart, **Then** a bar chart displays prediction activity bucketed by hour for the last 24 hours.
2. **Given** the admin selects "Last 7 Days" from the time filter, **When** the chart refreshes, **Then** it displays daily prediction activity for the past 7 days.
3. **Given** predictions exist across multiple leagues, **When** the admin views the "Top Performing Markets" section, **Then** leagues are listed in descending order by percentage of total predictions, each with a labeled progress bar.

---

### User Story 3 - Review Recent System Activity Logs (Priority: P3)

As an admin, I want to see a table of recent system events (match settlements, admin actions, flagged activity) so that I can stay aware of platform operations and quickly spot issues that may require attention.

The dashboard shows the most recent system log entries in a table with columns for timestamp, action/event description, actor (user or system), and status badge (success, warning, updated). A link allows the admin to navigate to the full logs view.

**Why this priority**: Activity logs provide the operational awareness layer. Without them, the admin has metrics but no context about what is happening on the platform.

**Independent Test**: Can be tested by triggering system events (settling a match, updating criteria) and verifying they appear in the recent logs table with correct timestamps and status badges.

**Acceptance Scenarios**:

1. **Given** system events have occurred (match settlements, admin updates, flagged patterns), **When** the admin views the "Recent System Logs" table, **Then** the most recent events are listed with timestamp, event description, actor, and a color-coded status badge.
2. **Given** the admin wants to see more log history, **When** they click "View Full Logs", **Then** they are navigated to a detailed log view page.

---

### User Story 4 - Review Moderation Queue (Priority: P3)

As an admin, I want to see pending moderation items (reported comments, disputed predictions) in a compact queue so that I can quickly triage and act on issues that require human review.

The dashboard shows a moderation queue panel listing items that need admin attention, categorized by type (e.g., abusive content reports, disputed predictions), with quick-action buttons to review or dismiss each item and a count of total pending items.

**Why this priority**: Moderation is essential for platform integrity but is secondary to operational metrics. The queue provides a summary; detailed moderation happens on a dedicated page.

**Independent Test**: Can be tested by creating reported comments or disputed predictions and verifying they appear in the moderation queue with correct metadata and functional action buttons.

**Acceptance Scenarios**:

1. **Given** users have reported comments or disputed prediction outcomes, **When** the admin views the "Moderation Queue" panel, **Then** pending items are listed with type, related entity (user or match), and time since creation.
2. **Given** a moderation item is displayed, **When** the admin clicks "Review", **Then** they are navigated to the relevant detail view for that item.
3. **Given** a moderation item is displayed, **When** the admin clicks "Dismiss", **Then** the item is removed from the queue and marked as dismissed.
4. **Given** the admin wants to handle all moderation tasks, **When** they click "Go to Moderation Hub", **Then** they are navigated to the full moderation management page with a count of pending items.

---

### User Story 5 - Filter and Export Dashboard Data (Priority: P4)

As an admin, I want to filter the dashboard data by date range and export a report so that I can share platform performance summaries with stakeholders or keep records.

The dashboard header includes a filter button to adjust the date range for metrics and an export button that generates a downloadable report of the current dashboard state.

**Why this priority**: Filtering and exporting are convenience features that enhance the dashboard but are not essential for day-to-day monitoring.

**Independent Test**: Can be tested by applying a date filter and verifying metrics update accordingly, and by clicking export and verifying a report file is generated.

**Acceptance Scenarios**:

1. **Given** an admin clicks the "Filter" button, **When** they select a custom date range, **Then** the overview metrics and charts update to reflect only data within that range.
2. **Given** an admin clicks "Export Report", **When** the export completes, **Then** a downloadable report file is generated containing the current dashboard metrics and chart data.

---

### Edge Cases

- What happens when there are no predictions, no matches, or no users yet? The dashboard should display zero values gracefully with appropriate empty states (e.g., "No predictions yet" instead of blank cards).
- What happens when the system logs table has no recent events? An empty state message should be shown.
- What happens when the moderation queue is empty? The panel should indicate "No pending items" clearly.
- What happens if the admin accesses the dashboard on a mobile device? The layout should stack into a single-column view with the sidebar collapsing into a bottom navigation bar.
- What happens if data aggregation takes longer than expected? The dashboard should show loading indicators for each section independently rather than blocking the entire page.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST restrict access to the admin dashboard to authenticated users with the Admin role only.
- **FR-002**: System MUST display four key metric cards on the dashboard: total active users, active predictions count, total gold pool value (in GP, 2 decimal places), and system status indicator.
- **FR-003**: Each metric card MUST include a visual trend or status indicator (percentage change, mini chart, progress bar, or status label).
- **FR-004**: System MUST display a bar chart showing prediction activity over time, with selectable time ranges (last 24 hours by default, last 7 days as alternative).
- **FR-005**: System MUST display a ranked list of leagues by percentage of total prediction activity, ordered by descending share, each with a labeled progress bar.
- **FR-006**: System MUST display a table of recent system activity logs with columns: timestamp, action/event, actor (admin), and status (color-coded badge). Logged events are limited to admin-triggered actions: match create/edit/settle, criteria updates, and user management actions.
- **FR-007**: System MUST display a moderation queue panel. When moderation data is available (from a future reporting/dispute feature), it shows pending items with type, related entity, time since creation, and action buttons (Review, Dismiss). When no moderation backend exists yet, the panel MUST display an empty state (e.g., "No pending items").
- **FR-008**: The "Review" action on a moderation item MUST navigate the admin to the relevant detail view for that item (functional only when moderation backend is available).
- **FR-009**: The "Dismiss" action on a moderation item MUST remove it from the queue and mark it as resolved/dismissed (functional only when moderation backend is available).
- **FR-010**: System MUST provide a "View Full Logs" link that navigates to a detailed activity log page.
- **FR-011**: System MUST provide a "Go to Moderation Hub" link with a count of total pending moderation items.
- **FR-012**: System MUST provide a date range filter that updates all dashboard metrics and charts when applied.
- **FR-013**: System MUST provide an "Export Report" function that generates a downloadable CSV file summarizing the current dashboard metrics, traffic data, and league breakdown for the selected date range.
- **FR-014**: The admin sidebar navigation MUST provide links to: Dashboard, User Manager, Match Center, Point Rules, and Analytics sections.
- **FR-015**: The dashboard MUST display a "System Live" indicator when the platform is operational.
- **FR-016**: The dashboard layout MUST be responsive, stacking to a single column on mobile with a bottom navigation bar replacing the sidebar.
- **FR-017**: The dashboard MUST auto-refresh all displayed data every 30–60 seconds via periodic polling without requiring a full page reload.

### Key Entities

- **Dashboard Metrics**: Aggregated platform statistics (user count, prediction count, gold pool total, system status) computed from existing entities (User, Prediction, Match, GoldTransaction).
- **System Log Entry**: A record of an admin-triggered action (match create/edit/settle, criteria updates, user management), including timestamp, event description, admin actor identity, and outcome status. Retention period: 90 days (entries older than 90 days are automatically cleaned up). Automated system events and user-flagged activity are out of scope for initial implementation.
- **Moderation Item**: A pending review task generated by user reports on comments or disputed prediction outcomes, including type, related entity reference, creation time, and resolution status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can assess platform health (user activity, prediction volume, gold circulation, system status) within 5 seconds of loading the dashboard.
- **SC-002**: The dashboard loads and displays all metric cards and charts within 3 seconds on a standard connection.
- **SC-003**: Admins can identify and begin reviewing a moderation item within 2 clicks from the dashboard.
- **SC-004**: Dashboard data auto-refreshes every 30–60 seconds via periodic polling; displayed data is never more than 60 seconds stale.
- **SC-005**: The dashboard is fully usable on both desktop (1024px+) and mobile (320px+) viewports.
- **SC-006**: Admins can export a dashboard report in under 10 seconds.

## Clarifications

### Session 2026-06-26

- Q: What data freshness strategy should the dashboard use? → A: Periodic polling (auto-refresh every 30–60 seconds)
- Q: Should the moderation queue backend (comment reporting, prediction disputes) be built as part of this feature? → A: Dashboard UI only — show the moderation queue panel with empty state; the reporting/dispute backend will be a separate feature
- Q: What system events should be logged for the dashboard's "Recent System Logs" table? → A: Admin actions only (match create/edit/settle, criteria updates, user management actions)
- Q: How long should system log entries be retained? → A: 90 days
- Q: What format should the exported dashboard report use? → A: CSV

## Assumptions

- The existing authentication and RBAC system (authenticate + requireRole('ADMIN') middleware) is in place and will be reused for dashboard access control.
- System activity logging infrastructure does not yet exist and will be introduced as part of this feature, scoped to admin-triggered actions only (match CRUD, criteria updates, user management). Automated system events and user-flagged activity logging are deferred to future features.
- The moderation backend (comment reporting, prediction disputes) is explicitly out of scope for this feature. The dashboard moderation queue panel will be built as UI-only with an empty state; it will become functional when a separate moderation feature provides the backend.
- Gold pool values use the existing Decimal-based gold transaction data; no new financial models are introduced.
- The "Export Report" function will generate a CSV file. No PDF or other format is required for the initial implementation.
- League data comes from the existing team/match structure; leagues are inferred from the competition/league field on matches synced from api-football.
- The dashboard is a read-only overview; all management actions (creating matches, managing users, updating criteria) happen on their respective dedicated pages accessible via the sidebar navigation.

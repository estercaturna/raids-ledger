# reset-countdown Specification

## Purpose
TBD - created by archiving change reset-countdown. Update Purpose after archive.

## Requirements

### Requirement: Next reset instant from the API
The system SHALL include the next weekly reset instant (the current week start plus seven days, as an ISO timestamp) in the tracker payload.

#### Scenario: Mid-week request
- **WHEN** the tracker is fetched during a game week
- **THEN** `nextReset` equals the week start plus seven days

### Requirement: Live countdown to reset
The tracker page SHALL show the time remaining until `nextReset` as days, hours, minutes and seconds while the current week is selected, updating without a page reload.

#### Scenario: Time remaining
- **WHEN** the current week is shown and the reset is 3 days 4 hours 12 minutes 5 seconds away
- **THEN** the page shows "Reset in 3d 4h 12m 5s"

#### Scenario: Reset passes while open
- **WHEN** the countdown reaches zero while the page is open
- **THEN** the page reloads the tracker data so the new week starts

#### Scenario: Past week selected
- **WHEN** a week from the history is selected
- **THEN** the countdown is hidden

# Spec Delta

## Purpose
Shows the owner of one configured tracker whose turn it is each game week, alternating automatically between two names so the strongest accounts are shared fairly.

## ADDED Requirements

### Requirement: Alternating current-week label
The system SHALL compute a rotation name for each game week by alternating between two configured names, starting from a configured anchor week, using only the week start and no stored state.

#### Scenario: Anchor week
- **WHEN** the current game week is the configured anchor week
- **THEN** the rotation name is the configured anchor name (Phirk)

#### Scenario: Following week
- **WHEN** the game week is one week after the anchor week
- **THEN** the rotation name is the other configured name (Skyfire)

#### Scenario: Weeks before the anchor
- **WHEN** the game week is before the anchor week
- **THEN** the rotation name still alternates consistently by week parity

### Requirement: Label restricted to the configured token
The system SHALL expose the rotation label only on requests whose token hash equals the configured rotation token hash, and SHALL NOT expose it to any other tracker.

#### Scenario: Matching token
- **WHEN** the tracker is opened with the token whose hash equals the configured value
- **THEN** the page shows "Current week: <name>" and week-selector entries show their rotation name

#### Scenario: Other token
- **WHEN** a tracker is opened with any other valid token
- **THEN** no rotation label or name is shown and responses contain no rotation data

#### Scenario: Not configured
- **WHEN** the token hash, anchor week, or either name is not configured
- **THEN** no tracker shows a rotation label

### Requirement: Rotation follows the weekly reset
The label SHALL change at the weekly reset instant without the user visiting.

#### Scenario: Reset boundary crossed
- **WHEN** the Wednesday reset time passes
- **THEN** the next request shows the other name

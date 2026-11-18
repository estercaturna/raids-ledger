# week-rotation-label Specification

## Purpose
Shows the owner of one configured tracker whose turn it is each game week, alternating automatically between two names so the strongest accounts are shared fairly.

## Requirements

### Requirement: Alternating current-week label
The system SHALL compute a default rotation name for each game week by alternating between two configured names, starting from a configured anchor week, using only the week start. A stored override for that week, when present, SHALL take precedence over the computed name.

#### Scenario: Anchor week
- **WHEN** the current game week is the configured anchor week and has no override
- **THEN** the rotation name is the configured anchor name (Phirk)

#### Scenario: Following week
- **WHEN** the game week is one week after the anchor week and has no override
- **THEN** the rotation name is the other configured name (Skyfire)

#### Scenario: Weeks before the anchor
- **WHEN** the game week is before the anchor week and has no override
- **THEN** the rotation name still alternates consistently by week parity

#### Scenario: Override wins
- **WHEN** a week has an override of Phirk while parity gives Skyfire
- **THEN** the rotation name for that week is Phirk

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

### Requirement: Rotation name can be overridden per week
The system SHALL let the configured tracker set the rotation name of a single game week to one of the two configured names, or clear it to return to the automatic name. An override SHALL affect only its own week and SHALL NOT change the name of any other week. Only the current week and past weeks can be overridden.

#### Scenario: Override the current week
- **WHEN** parity gives Skyfire for the current week and the user selects Phirk
- **THEN** the label shows "Current week: Phirk" and the following week still follows parity

#### Scenario: Correct a past week
- **WHEN** the user selects Skyfire for last week, whose automatic name is Phirk
- **THEN** the week selector and history show Skyfire for that week

#### Scenario: Clear an override
- **WHEN** the user selects Automatic for a week that has an override
- **THEN** the override is removed and the name returns to the parity value

#### Scenario: Unknown name rejected
- **WHEN** a request sets a name other than the two configured names
- **THEN** it is rejected with a 400 error and nothing is stored

#### Scenario: Future week rejected
- **WHEN** a request overrides a week that has not started
- **THEN** it is rejected with a 400 error and nothing is stored

### Requirement: Override restricted to the configured token
The system SHALL accept rotation overrides only on requests whose token hash equals the configured rotation token hash, and SHALL NOT expose or apply overrides for any other tracker.

#### Scenario: Other token
- **WHEN** a different valid token tries to set an override
- **THEN** the request is rejected with 404 and nothing is stored

#### Scenario: Not configured
- **WHEN** the token hash, anchor week, or either name is not configured
- **THEN** overrides cannot be set

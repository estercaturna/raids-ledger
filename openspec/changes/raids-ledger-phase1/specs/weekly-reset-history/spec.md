# Spec Delta

## Purpose

Starts each game week with a clean clear state on the Wednesday reset while preserving previous weeks so the user can review them.

## ADDED Requirements

### Requirement: Weekly reset on Wednesday
The system SHALL treat clears as belonging to a game week that begins at the Wednesday reset time, so that a new week shows no clears.

#### Scenario: Reset boundary crossed
- **WHEN** the Wednesday reset time passes
- **THEN** the current-week view shows all raids uncleared for every character

#### Scenario: Before the boundary
- **WHEN** a clear is recorded before the Wednesday reset time
- **THEN** it is attributed to the week that ends at that reset

### Requirement: Reset does not depend on user visits
The system SHALL determine the current week from the time of each request, so correctness does not require the user to be active at reset time.

#### Scenario: User returns days later
- **WHEN** the user opens the tracker several weeks after the last visit
- **THEN** the current week is shown empty and prior weeks remain in history

### Requirement: Browsable history
The system SHALL retain past weeks' clears per character and let the user view them.

#### Scenario: View past week
- **WHEN** the user selects a previous week
- **THEN** the cleared raids of that week are shown read-only

#### Scenario: Eligibility snapshot
- **WHEN** a past week is displayed
- **THEN** it shows the clears as recorded, even if character ilvl has since changed

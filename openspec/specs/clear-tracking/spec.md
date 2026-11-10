# clear-tracking Specification

## Purpose
Lets the user record which eligible raids each character has cleared this week with minimal interaction, and see the state persisted.

## Requirements

### Requirement: One-click clear toggle
The system SHALL let the user toggle a raid's cleared state for a character with a single click, and SHALL persist the change.

#### Scenario: Mark cleared
- **WHEN** the user clicks an unchecked raid checkbox for a character
- **THEN** the raid is shown as cleared and the state is saved to the server

#### Scenario: Unmark cleared
- **WHEN** the user clicks a checked raid checkbox
- **THEN** the raid is shown as not cleared and the state is saved

### Requirement: Weekly clear limit per character
The system SHALL allow at most 3 raids to be marked as cleared per character per week, in the interface and in the API.

#### Scenario: Limit reached
- **WHEN** a character already has 3 raids cleared this week
- **THEN** its remaining raids cannot be ticked and the API rejects a further clear until one is unmarked

### Requirement: Mark all
The system SHALL provide a "mark all" action, scoped to a single character and to the whole tracker, that keeps existing clears and fills the remaining slots up to the weekly limit with the highest-paying eligible raids.

#### Scenario: Mark all for a character
- **WHEN** the user triggers "mark all" on a character
- **THEN** that character's 3 highest-paying eligible raids become cleared, keeping any raids already cleared

#### Scenario: Mark all for tracker
- **WHEN** the user triggers the tracker-wide "mark all"
- **THEN** the same fill rule is applied to every character

### Requirement: Failed save feedback
The system SHALL revert an optimistic checkbox change and notify the user when saving fails.

#### Scenario: Save fails
- **WHEN** a clear toggle cannot be saved
- **THEN** the checkbox returns to its previous state and an error is shown

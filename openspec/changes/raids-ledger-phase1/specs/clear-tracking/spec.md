# Spec Delta

## Purpose

Lets the user record which eligible raids each character has cleared this week with minimal interaction, and see the state persisted.

## ADDED Requirements

### Requirement: One-click clear toggle
The system SHALL let the user toggle a raid's cleared state for a character with a single click, and SHALL persist the change.

#### Scenario: Mark cleared
- **WHEN** the user clicks an unchecked raid checkbox for a character
- **THEN** the raid is shown as cleared and the state is saved to the server

#### Scenario: Unmark cleared
- **WHEN** the user clicks a checked raid checkbox
- **THEN** the raid is shown as not cleared and the state is saved

### Requirement: Mark all
The system SHALL provide a "mark all" action that marks every eligible raid as cleared, scoped to a single character and to the whole tracker.

#### Scenario: Mark all for a character
- **WHEN** the user triggers "mark all" on a character
- **THEN** all that character's eligible raids become cleared

#### Scenario: Mark all for tracker
- **WHEN** the user triggers the tracker-wide "mark all"
- **THEN** all eligible raids of all characters become cleared

### Requirement: Failed save feedback
The system SHALL revert an optimistic checkbox change and notify the user when saving fails.

#### Scenario: Save fails
- **WHEN** a clear toggle cannot be saved
- **THEN** the checkbox returns to its previous state and an error is shown

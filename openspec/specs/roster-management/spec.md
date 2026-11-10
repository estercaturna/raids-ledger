# roster-management Specification

## Purpose
Lets a user build and maintain the list of their characters, with class and item level, by entering them manually, since no public roster API covers the EU/NA game service.

## Requirements

### Requirement: Create tracker with initial characters
The system SHALL let the user create a tracker by entering one or more characters, each with a name, a class selected from the fixed list of Lost Ark classes, and an ilvl.

#### Scenario: Valid characters
- **WHEN** the user submits at least one character with a name, class and a valid ilvl
- **THEN** the system creates a tracker containing those characters

#### Scenario: Invalid input
- **WHEN** a character has an empty name, no class or an unknown class, or a non-numeric or out-of-range ilvl
- **THEN** the system rejects the input with a field-level error and creates no tracker

### Requirement: Edit roster
The system SHALL let the user add, edit and remove characters of an existing tracker, including updating a character's ilvl.

#### Scenario: ilvl increased
- **WHEN** the user updates a character's ilvl
- **THEN** the stored ilvl is updated and the character's eligible raids are recomputed
- **AND** existing clears for the current week are kept

#### Scenario: Remove character
- **WHEN** the user removes a character
- **THEN** it disappears from the current view and its clears are no longer shown

### Requirement: Unique character names
The system SHALL NOT allow two characters with the same name within one tracker.

#### Scenario: Duplicate name
- **WHEN** the user adds a character whose name already exists in the tracker
- **THEN** the system rejects it with an error

### Requirement: Custom character order
The system SHALL let the user drag characters to reorder them and SHALL persist the order, placing newly added characters last.

#### Scenario: Reorder
- **WHEN** the user drags a character card to a new position
- **THEN** the new order is saved and shown after reloading the page

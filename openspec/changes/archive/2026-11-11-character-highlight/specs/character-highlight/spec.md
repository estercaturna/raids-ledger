# Spec Delta

## Purpose
Makes the strongest characters stand out on the tracker by item level so the MVP and next strongest are recognizable at a glance.

## ADDED Requirements

### Requirement: MVP highlight
The system SHALL outline the card of the character with the highest item level in gold, and show that character's name and item level number in gold, in the current-week view.

#### Scenario: Single highest ilvl
- **WHEN** one character has the highest ilvl
- **THEN** its card has a gold outline

#### Scenario: MVP text color
- **WHEN** a character is the MVP
- **THEN** its name and item level number are also shown in gold

#### Scenario: Tied ilvl
- **WHEN** several characters share the highest ilvl
- **THEN** only the first of them in roster order is the MVP

### Requirement: Strong character highlight
The system SHALL outline the cards of the next two characters by descending item level, after the MVP, with a purple/pink outline.

#### Scenario: More than three characters
- **WHEN** a roster has more than three characters
- **THEN** ranks 2 and 3 by ilvl have the purple/pink outline and all others have none

#### Scenario: Small roster
- **WHEN** a roster has fewer than three characters
- **THEN** only the existing characters are highlighted, with no error

### Requirement: Highlight follows item level
The highlight SHALL be derived from current item levels, so editing an ilvl updates it.

#### Scenario: Ilvl edited
- **WHEN** a character's ilvl is changed above the current MVP
- **THEN** that character becomes the MVP and the previous MVP moves to the purple/pink tier

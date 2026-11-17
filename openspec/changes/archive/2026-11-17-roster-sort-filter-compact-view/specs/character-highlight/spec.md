## MODIFIED Requirements

### Requirement: MVP highlight
The system SHALL outline the card of the strongest character in gold, and show that character's name and item level number in gold, in the current-week view. Strength is item level descending, then combat power descending (missing CP last), then roster order.

#### Scenario: Single highest ilvl
- **WHEN** one character has the highest ilvl
- **THEN** its card has a gold outline

#### Scenario: MVP text color
- **WHEN** a character is the MVP
- **THEN** its name and item level number are also shown in gold

#### Scenario: Tied ilvl, higher CP
- **WHEN** several characters share the highest ilvl and one has the highest CP
- **THEN** that character is the MVP

#### Scenario: Tied ilvl
- **WHEN** several characters share the highest ilvl and CP (or none has CP)
- **THEN** only the first of them in roster order is the MVP

### Requirement: Strong character highlight
The system SHALL outline the cards of the next two characters by the same strength order, after the MVP, with a purple/pink outline.

#### Scenario: More than three characters
- **WHEN** a roster has more than three characters
- **THEN** ranks 2 and 3 by strength have the purple/pink outline and all others have none

#### Scenario: Small roster
- **WHEN** a roster has fewer than three characters
- **THEN** only the existing characters are highlighted, with no error

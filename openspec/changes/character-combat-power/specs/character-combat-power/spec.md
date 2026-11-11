# Spec Delta

## Purpose
Lets players record an optional combat power (CP) per character, shows it with the item level, and makes it the primary ranking for highlighting the strongest characters.

## ADDED Requirements

### Requirement: Optional combat power
The system SHALL let the user provide an optional positive CP number for a character when adding it and when editing it, and SHALL accept characters without CP.

#### Scenario: Add with CP
- **WHEN** a character is added with a valid CP
- **THEN** the CP is stored and returned with the character

#### Scenario: Add without CP
- **WHEN** a character is added without CP
- **THEN** it is created normally and has no CP

#### Scenario: Invalid CP
- **WHEN** a CP that is not a positive finite number within the allowed maximum is submitted
- **THEN** the request is rejected with a field error for `cp`

#### Scenario: Clear CP
- **WHEN** a character is edited with an empty CP
- **THEN** its CP is removed

### Requirement: CP shown with item level
The system SHALL show the CP on its own line below the class and item level, formatted `CP · <value>`, on current-week cards of characters that have CP.

#### Scenario: Character with CP
- **WHEN** a character has CP
- **THEN** its card shows the class and item level, and below them a line such as `CP · 6772`

#### Scenario: Character without CP
- **WHEN** a character has no CP
- **THEN** its card shows only the class and item level, with no CP line

### Requirement: Highlight ranking by CP
The system SHALL rank characters for the MAIN and purple/pink highlights by CP descending, treating a missing CP as lower than any CP, and breaking ties by item level descending and then roster order.

#### Scenario: Higher CP wins
- **WHEN** a character has higher CP but lower item level than another
- **THEN** it ranks above the other

#### Scenario: No CP anywhere
- **WHEN** no character has CP
- **THEN** ranking is by item level as before

#### Scenario: Mixed roster
- **WHEN** some characters have CP and others do not
- **THEN** characters with CP rank above those without, and those without are ordered by item level

### Requirement: CP color by role
The CP line SHALL use the same font size as the class and item level line, and SHALL be colored by role: a muted green for support classes (Bard, Paladin, Artist) and a muted red for all other classes.

#### Scenario: Support class
- **WHEN** a Bard has CP
- **THEN** its `CP · <value>` line is shown in muted green

#### Scenario: Other class
- **WHEN** a non-support character has CP
- **THEN** its `CP · <value>` line is shown in muted red

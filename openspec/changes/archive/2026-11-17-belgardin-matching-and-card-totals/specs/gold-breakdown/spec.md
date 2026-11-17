# Spec Delta

## Purpose

Shows how much of the gold a character earns is character-bound and how much is roster gold, per raid, per character card and per week, so the user can plan spending.

## ADDED Requirements

### Requirement: Character-bound gold per raid
The system SHALL define for each raid and difficulty how much of its gold is character-bound, with the remainder being roster gold. A raid with no bound value SHALL count as 100% roster gold.

#### Scenario: Normal Belgardin
- **WHEN** a character clears Belgardin Normal
- **THEN** its 50,000 gold counts as 0 character gold and 50,000 roster gold

#### Scenario: Matching Belgardin
- **WHEN** a character clears Belgardin Matching
- **THEN** its 50,000 gold counts as 25,000 character gold and 25,000 roster gold

#### Scenario: Hard and Nightmare Belgardin
- **WHEN** a character clears Belgardin Hard or Nightmare
- **THEN** all of the gold counts as roster gold

### Requirement: Weekly character and total gold per card
The system SHALL show on each character card the week's **Character gold** and **Total gold** (character plus roster), counting only the 3 highest-paying cleared raids, and SHALL update them when a clear is toggled.

#### Scenario: Card totals
- **WHEN** a character has cleared Belgardin Matching (50,000) and Kazeros Normal (32,000, 16,000 bound)
- **THEN** the card shows Character gold 41,000 G and Total gold 82,000 G

#### Scenario: Clear toggled
- **WHEN** the user ticks or unticks a raid on a card
- **THEN** both values update without a reload

#### Scenario: No clears
- **WHEN** a character has no cleared raids this week
- **THEN** the card shows Character gold 0 G and Total gold 0 G

### Requirement: Character and total gold in past weeks
The system SHALL show the same Character gold and Total gold values on a character's card for a past week, derived from the clears recorded that week.

#### Scenario: Past week card
- **WHEN** the user views a past week
- **THEN** each character card shows that week's Character gold and Total gold

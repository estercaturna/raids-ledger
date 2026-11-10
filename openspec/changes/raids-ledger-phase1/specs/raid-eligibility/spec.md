# Spec Delta

## Purpose

Shows, for each character, exactly which raids it can currently enter based on its item level, using a maintained raid requirements table.

## ADDED Requirements

### Requirement: Eligibility by ilvl
The system SHALL list for each character the raids and difficulties whose minimum ilvl is less than or equal to the character's ilvl.

#### Scenario: Meets requirement
- **WHEN** a character's ilvl equals or exceeds a raid's minimum ilvl
- **THEN** that raid is shown as eligible for the character

#### Scenario: Below requirement
- **WHEN** a character's ilvl is below a raid's minimum ilvl
- **THEN** that raid is not shown as clearable for the character

### Requirement: Highest difficulty per raid
The system SHALL present, per raid, only the highest difficulty the character is eligible for, unless the raid has a single difficulty.

#### Scenario: Eligible for several difficulties
- **WHEN** a character qualifies for both Normal and Hard of a raid
- **THEN** only the Hard entry is offered for that raid

### Requirement: Raid data is data-driven
The system SHALL derive eligibility from a raid requirements table that can be updated without changing eligibility logic.

#### Scenario: New raid added
- **WHEN** a raid entry is added to the requirements table
- **THEN** characters meeting its ilvl see it as eligible without further code changes

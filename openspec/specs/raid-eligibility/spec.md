# raid-eligibility Specification

## Purpose
Shows, for each character, exactly which raids it can currently enter based on its item level, using a maintained raid requirements table.

## Requirements

### Requirement: Eligibility by ilvl
The system SHALL list for each character the raids and difficulties whose minimum ilvl is less than or equal to the character's ilvl.

#### Scenario: Meets requirement
- **WHEN** a character's ilvl equals or exceeds a raid's minimum ilvl
- **THEN** that raid is shown as eligible for the character

#### Scenario: Below requirement
- **WHEN** a character's ilvl is below a raid's minimum ilvl
- **THEN** that raid is not shown as clearable for the character

### Requirement: One difficulty per raid, chosen by the user
The system SHALL present each eligible raid once, using the highest eligible difficulty by default, and SHALL let the user pick any lower difficulty the character still qualifies for, persisting that choice per character and raid.

#### Scenario: Eligible for several difficulties
- **WHEN** a character qualifies for both Normal and Hard of a raid
- **THEN** only the Hard entry is shown by default, with a selector offering Normal and Hard

#### Scenario: Preferred difficulty no longer eligible
- **WHEN** a stored preferred difficulty is no longer eligible for the character's ilvl
- **THEN** the highest eligible difficulty is used instead

### Requirement: Gold per raid and weekly total
The system SHALL show the gold reward of each raid and difficulty, and the gold earned this week per character, counting only its 3 highest-paying cleared raids. Past weeks SHALL show the same total.

#### Scenario: Weekly total
- **WHEN** a character has cleared raids paying 54,000, 50,000, 50,000 and 38,000 gold
- **THEN** the weekly total is 154,000 gold

#### Scenario: Gold not published
- **WHEN** a raid has no gold value in the table
- **THEN** it is shown without a value and counts as zero

### Requirement: Raid data is data-driven
The system SHALL derive eligibility from a raid requirements table that can be updated without changing eligibility logic.

#### Scenario: New raid added
- **WHEN** a raid entry is added to the requirements table
- **THEN** characters meeting its ilvl see it as eligible without further code changes

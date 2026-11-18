# gold-earner-limit Specification

## Purpose
Limits weekly gold to the characters that can actually earn it in the game: at most 6 per roster, chosen by item level, so card, roster and history totals match what the user will really receive.

## Requirements

### Requirement: Only the top 6 characters earn gold
The system SHALL treat at most 6 characters per roster as gold earners: the 6 with the highest item level, ties broken by higher combat power (a character without combat power ranks last), then by roster order. Characters that are not gold earners SHALL count as 0 character gold and 0 total gold from regular raids, while still being able to record clears. Gold from event raids SHALL be paid in full regardless of gold earner status.

#### Scenario: Roster of 6 or fewer
- **WHEN** a roster has 6 or fewer characters
- **THEN** every character is a gold earner

#### Scenario: Seventh character
- **WHEN** a roster has 7 characters
- **THEN** the character with the lowest item level earns no gold from regular raids and the other 6 do

#### Scenario: Tie on item level
- **WHEN** the 6th and 7th characters have the same item level and the 7th has higher combat power
- **THEN** the 7th is a gold earner and the 6th is not

#### Scenario: Ranking follows edits
- **WHEN** the user raises a character's item level above the lowest earner's
- **THEN** that character becomes a gold earner and the displaced one stops earning gold from regular raids, without any other action

#### Scenario: Non-earner clears an event raid
- **WHEN** a character outside the top 6 clears Extreme Mordum Normal
- **THEN** its event gold of 20,000 counts in its total gold and in the roster totals

### Requirement: Card and roster totals count only gold earners
The system SHALL show Character gold 0 G and a Total gold of 0 G from regular raids on the card of a character that is not a gold earner, SHALL indicate on that card that it earns no gold from regular raids, and SHALL leave its regular raid gold out of the roster totals. Clears recorded by a non-earner SHALL still be shown as cleared, and gold from its cleared event raids SHALL still be shown and counted.

#### Scenario: Non-earner card
- **WHEN** a character outside the top 6 has cleared regular raids and no event raid
- **THEN** its raids are shown as cleared, its gold lines show 0 G, and the card indicates that it earns no gold

#### Scenario: Non-earner card with an event raid
- **WHEN** a character outside the top 6 has cleared Extreme Mordum Normal and regular raids
- **THEN** its Total gold shows 20,000 G and the card still indicates that it earns no gold from regular raids

#### Scenario: Roster totals
- **WHEN** a roster has 7 characters that each earn 50,000 gold from regular raids
- **THEN** the roster totals add up 6 characters, not 7

### Requirement: Past weeks use the same earners
The system SHALL apply the same rule to past-week cards and totals, using the current roster ranking.

#### Scenario: Past week with a non-earner
- **WHEN** the user views a past week in which a character outside the top 6 has clears of regular raids
- **THEN** that character's past-week gold from regular raids shows 0 G

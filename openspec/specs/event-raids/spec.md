# event-raids Specification

## Purpose
Supports time-limited event raids that pay gold on top of the weekly 3-raid limit, are shown apart from regular raids, and can be cleared by only one character per tracker each week.

## Requirements

### Requirement: Event raids have an availability window
The system SHALL support event raids: time-limited raids defined in the raid requirements table with a first and last game week in which they are offered, using the same item level eligibility rules as other raids. Act 3 Extreme (Mordum) SHALL be defined with Normal (item level 1,730, 20,000 gold) and Hard (item level 1,770, 50,000 gold), available from the week of 18 Nov 2026 to the week of 9 Dec 2026 inclusive.

#### Scenario: Inside the window
- **WHEN** a character with item level 1,745 is shown for the week of 18 Nov 2026
- **THEN** Extreme Mordum is offered with Normal as the only selectable difficulty

#### Scenario: Below the requirement
- **WHEN** a character's item level is below 1,730
- **THEN** Extreme Mordum is not offered for that character

#### Scenario: After the window
- **WHEN** the current week is the week of 16 Dec 2026 or later
- **THEN** Extreme Mordum is no longer offered for the current week

#### Scenario: Before the window
- **WHEN** the current week is before the week of 18 Nov 2026
- **THEN** Extreme Mordum is not offered

### Requirement: Event raids are shown apart from the weekly gold raids
The system SHALL show a character's event raids in their own labelled section of its card, with the end date of the window, after the regular raids. Event raids SHALL NOT count towards the card's cleared counter (`n/3`) and SHALL NOT disable ticking of regular raids.

#### Scenario: Event section
- **WHEN** a character has an available event raid
- **THEN** the card shows an Event section below the regular raids containing it

#### Scenario: Counter unaffected
- **WHEN** a character has cleared 3 regular raids and ticks an event raid
- **THEN** the counter keeps showing 3/3 and the event raid is shown as cleared

#### Scenario: No available event raid
- **WHEN** a character has no event raid available
- **THEN** the card shows no Event section

### Requirement: One event raid entry per tracker per week
The system SHALL allow an event raid to be cleared by at most one character of the tracker per week, whichever of its difficulties is used, in the interface and in the API.

#### Scenario: Second character blocked
- **WHEN** a character has cleared Extreme Mordum this week and the user tries to tick it for another character
- **THEN** the other character's Extreme Mordum cannot be ticked, and the API rejects the clear until the first one is unmarked

#### Scenario: Unmarking frees the entry
- **WHEN** the user unticks the Extreme Mordum clear
- **THEN** another character can tick it again this week

#### Scenario: New week
- **WHEN** a new game week starts
- **THEN** the entry is available again to any character

### Requirement: Event raid gold is paid on top of the weekly gold
The system SHALL add the gold of each cleared event raid to the character's weekly gold outside the top-3 cut, and SHALL NOT let an event raid displace or be displaced by a regular raid. Event raid gold SHALL be treated as roster gold unless the table defines a character-bound part. Event raids SHALL be ignored by "mark all".

#### Scenario: Four paying clears
- **WHEN** a character has cleared regular raids paying 54,000, 48,000 and 40,000 gold and Extreme Mordum Normal (20,000)
- **THEN** the weekly total is 162,000 gold

#### Scenario: Event raid does not use a slot
- **WHEN** a character has cleared Extreme Mordum and 2 regular raids
- **THEN** a third regular raid can still be ticked

#### Scenario: Mark all
- **WHEN** the user triggers "mark all"
- **THEN** no event raid is marked as cleared

### Requirement: Event raid clears stay in history
The system SHALL keep clears of an event raid after its window ends and SHALL include their gold in the totals of the weeks in which they were recorded.

#### Scenario: Past week
- **WHEN** the user views a week in which a character cleared Extreme Mordum
- **THEN** the card shows the event raid as cleared and its gold is part of the week's total

#### Scenario: Event over
- **WHEN** the event window has ended
- **THEN** past weeks with event raid clears are unchanged

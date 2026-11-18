## MODIFIED Requirements

### Requirement: Weekly clear limit per character
The system SHALL allow at most 3 regular raids to be marked as cleared per character per week, in the interface and in the API. Event raids SHALL NOT count towards this limit.

#### Scenario: Limit reached
- **WHEN** a character already has 3 regular raids cleared this week
- **THEN** its remaining regular raids cannot be ticked and the API rejects a further clear until one is unmarked

#### Scenario: Event raid at the limit
- **WHEN** a character already has 3 regular raids cleared this week
- **THEN** an available event raid can still be ticked

### Requirement: Mark all
The system SHALL provide a "mark all" action, scoped to a single character and to the whole tracker, that keeps existing clears and fills the remaining slots up to the weekly limit with the highest-paying eligible regular raids. It SHALL NOT mark event raids.

#### Scenario: Mark all for a character
- **WHEN** the user triggers "mark all" on a character
- **THEN** that character's 3 highest-paying eligible regular raids become cleared, keeping any raids already cleared

#### Scenario: Mark all for tracker
- **WHEN** the user triggers the tracker-wide "mark all"
- **THEN** the same fill rule is applied to every character

#### Scenario: Event raid left alone
- **WHEN** the user triggers "mark all" while an event raid is available
- **THEN** the event raid keeps its previous cleared state

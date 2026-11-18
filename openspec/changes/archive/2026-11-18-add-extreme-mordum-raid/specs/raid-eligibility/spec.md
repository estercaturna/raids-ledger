## MODIFIED Requirements

### Requirement: Gold per raid and weekly total
The system SHALL show the gold reward of each raid and difficulty, and the gold earned this week per character, counting only its 3 highest-paying cleared regular raids plus the gold of any cleared event raids. Event raids SHALL NOT take part in the top-3 selection. Past weeks SHALL show the same total.

#### Scenario: Weekly total
- **WHEN** a character has cleared raids paying 54,000, 50,000, 50,000 and 38,000 gold
- **THEN** the weekly total is 154,000 gold

#### Scenario: Weekly total with an event raid
- **WHEN** a character has cleared regular raids paying 54,000, 50,000 and 50,000 gold and Extreme Mordum Hard paying 50,000 gold
- **THEN** the weekly total is 204,000 gold

#### Scenario: Gold not published
- **WHEN** a raid has no gold value in the table
- **THEN** it is shown without a value and counts as zero

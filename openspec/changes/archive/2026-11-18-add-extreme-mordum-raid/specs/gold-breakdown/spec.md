## MODIFIED Requirements

### Requirement: Weekly character and total gold per card
The system SHALL show on each character card the week's **Character gold** and **Total gold** (character plus roster), counting only the 3 highest-paying cleared regular raids plus the gold of cleared event raids, and SHALL update them when a clear is toggled.

#### Scenario: Card totals
- **WHEN** a character has cleared Belgardin Matching (50,000) and Kazeros Normal (32,000, 16,000 bound)
- **THEN** the card shows Character gold 41,000 G and Total gold 82,000 G

#### Scenario: Event raid on the card
- **WHEN** a character with those clears also clears Extreme Mordum Normal (20,000, no bound part)
- **THEN** the card shows Character gold 41,000 G and Total gold 102,000 G

#### Scenario: Clear toggled
- **WHEN** the user ticks or unticks a raid on a card
- **THEN** both values update without a reload

#### Scenario: No clears
- **WHEN** a character has no cleared raids this week
- **THEN** the card shows Character gold 0 G and Total gold 0 G

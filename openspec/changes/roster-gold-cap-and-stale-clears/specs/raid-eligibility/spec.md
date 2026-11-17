# Spec Delta

## MODIFIED Requirements

### Requirement: One difficulty per raid, chosen by the user
The system SHALL present each eligible raid once, using the highest eligible difficulty by default, and SHALL let the user pick any lower difficulty the character still qualifies for, persisting that choice per character and raid. A raid MAY also offer Matching Mode as a selectable option with the Normal item level and gold; Matching Mode SHALL never be the default. When the user picks a different difficulty for a raid, the system SHALL remove that character's clear of any other difficulty of the same raid from the current week, so it no longer counts towards gold or history.

#### Scenario: Eligible for several difficulties
- **WHEN** a character qualifies for both Normal and Hard of a raid
- **THEN** only the Hard entry is shown by default, with a selector offering Normal and Hard

#### Scenario: Preferred difficulty no longer eligible
- **WHEN** a stored preferred difficulty is no longer eligible for the character's ilvl
- **THEN** the highest eligible difficulty is used instead

#### Scenario: Matching Mode offered
- **WHEN** a character qualifies for Belgardin Normal (item level 1,750 or higher)
- **THEN** the selector also offers Matching, and Belgardin Normal is still the default unless a higher difficulty qualifies

#### Scenario: Matching Mode chosen
- **WHEN** the user selects Matching for Belgardin
- **THEN** the choice is persisted for that character and the raid shows the Matching gold

#### Scenario: Difficulty changed after clearing
- **WHEN** a character has cleared Serca Nightmare this week and the user switches Serca to Hard
- **THEN** the Nightmare clear is removed, Serca Hard is shown as not cleared, and the Nightmare gold no longer counts this week or in history

#### Scenario: Other raids and past weeks untouched
- **WHEN** the user changes the difficulty of one raid
- **THEN** clears of other raids, and clears recorded in past weeks, are unchanged

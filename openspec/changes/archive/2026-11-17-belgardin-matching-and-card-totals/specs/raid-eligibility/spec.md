# Spec Delta

## MODIFIED Requirements

### Requirement: One difficulty per raid, chosen by the user
The system SHALL present each eligible raid once, using the highest eligible difficulty by default, and SHALL let the user pick any lower difficulty the character still qualifies for, persisting that choice per character and raid. A raid MAY also offer Matching Mode as a selectable option with the Normal item level and gold; Matching Mode SHALL never be the default.

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

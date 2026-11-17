# visual-style Specification

## Purpose
TBD - created by archiving change visual-polish-cards-gold-main. Update Purpose after archive.

## Requirements

### Requirement: Card appearance
Character cards SHALL use rounded corners, a soft shadow and a subtle lift on hover, and the avatar SHALL be ringed in a color derived from the character's class archetype.

#### Scenario: Class ring
- **WHEN** a card is rendered for a character
- **THEN** its avatar has a ring tinted by the archetype color of that class

### Requirement: Raid chip difficulty accent
Each raid chip SHALL show a left accent in a color matching its selected difficulty, and a cleared chip SHALL show a round checked marker with a green tint.

#### Scenario: Difficulty accent
- **WHEN** a raid is set to Hard
- **THEN** its chip has the Hard accent color, and changing the difficulty updates the accent

#### Scenario: Locked chip
- **WHEN** a chip is locked because the character already has 3 clears
- **THEN** it keeps a muted appearance and cannot be toggled

### Requirement: Gold figures
Gold figures on cards SHALL be shown with a coin marker and enlarged values, with the Total tile highlighted in gold. For characters outside the gold earners the marker and values SHALL be muted.

#### Scenario: Earner
- **WHEN** a character earns gold
- **THEN** its Total tile is highlighted in gold

#### Scenario: Non-earner
- **WHEN** a character is outside the top 6
- **THEN** the coin marker and values are greyed

### Requirement: Roster totals tiles
The roster totals SHALL be shown as two separate gold-bordered tiles with no enclosing box.

#### Scenario: Totals header
- **WHEN** the roster view is shown
- **THEN** "Character Gold total" and "Roster Gold total" are separate tiles

### Requirement: Main card styling
The main card SHALL keep its gold frame in all states including hover, show the "MAIN" badge on the outline line, and play a slow shine that never extends outside the card.

#### Scenario: Hover on main
- **WHEN** the pointer is over the main card
- **THEN** the gold frame remains visible

#### Scenario: Shine contained
- **WHEN** the shine animation plays
- **THEN** nothing is painted outside the card bounds

### Requirement: Strong cards outline animation
The two strong cards SHALL show a purple/pink light that travels around the card outline, in addition to the static outline.

#### Scenario: Orbiting light
- **WHEN** a card is one of the two strong characters
- **THEN** a light loops around its outline

### Requirement: Page background
The page background SHALL use a deep gradient with a faint dotted texture, without reducing text contrast.

#### Scenario: Readability
- **WHEN** the page is shown
- **THEN** text and controls keep their existing contrast against the background

### Requirement: Reduced motion
All animations and hover transforms introduced by this style SHALL be disabled when the user prefers reduced motion; static styling SHALL remain.

#### Scenario: Reduced motion on
- **WHEN** `prefers-reduced-motion: reduce` is set
- **THEN** the shine, the orbiting light and the lift do not animate, and the frames still render

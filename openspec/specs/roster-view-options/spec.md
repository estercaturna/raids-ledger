# roster-view-options Specification

## Purpose
TBD - created by archiving change roster-sort-filter-compact-view. Update Purpose after archive.

## Requirements

### Requirement: Sort the roster view
The current-week roster view SHALL offer sorting by roster order (default), item level (descending, ties broken by combat power, missing CP last) and combat power (descending, missing CP last, ties broken by item level). Remaining ties SHALL keep roster order. Sorting SHALL NOT change the persisted roster order.

#### Scenario: Sort by item level
- **WHEN** the user selects "Item level"
- **THEN** cards are shown from highest to lowest item level and the stored order is unchanged

#### Scenario: Equal item level
- **WHEN** sorting by item level and two characters share an ilvl
- **THEN** the one with higher CP is listed first

#### Scenario: Missing combat power
- **WHEN** sorting by combat power and a character has no CP
- **THEN** that character is listed after all characters with CP

### Requirement: Filter gold earners
The roster view SHALL offer a "Gold earners only" filter that hides characters outside the top gold earners.

#### Scenario: Filter on
- **WHEN** the filter is enabled on a roster of 7 characters
- **THEN** only the 6 gold earners are shown and roster totals are unchanged

#### Scenario: Filter hides nothing
- **WHEN** all characters are gold earners
- **THEN** every character remains visible

### Requirement: Remember view preferences
Sort, filter and layout choices SHALL persist per tracker in browser storage and be restored on load.

#### Scenario: Reload
- **WHEN** the user reloads the tracker after choosing Item level sort and the earners filter
- **THEN** both choices are still applied

### Requirement: Reordering stays available
Drag-to-reorder SHALL remain active under any sort, filter or layout. A drop SHALL move only the dragged character within the persisted roster order, placed next to the character it was dropped beside, and SHALL NOT reorder other characters or hidden ones relative to each other.

#### Scenario: Drag while filtered
- **WHEN** the earners filter is on and the user drops card X before card Y
- **THEN** X is saved immediately before Y in the roster order and hidden characters keep their relative order

#### Scenario: Drag while sorted
- **WHEN** sort is "Item level" and the user drops a card
- **THEN** the persisted roster order is updated for that card only; the view stays sorted by item level

### Requirement: Respectful motion
Animations SHALL be subtle and SHALL be disabled when the user prefers reduced motion.

#### Scenario: Reduced motion
- **WHEN** `prefers-reduced-motion: reduce` is set
- **THEN** no transitions or animations run

### Requirement: Main card always first
The current-week view SHALL always show the main (MVP) character as the first card, regardless of sort, filter or stored roster order. This SHALL NOT change the persisted order.

#### Scenario: Sorted by combat power
- **WHEN** sorting by combat power and another character has higher CP than the main
- **THEN** the main is still the first card, followed by the rest in sort order

#### Scenario: Dragged above main
- **WHEN** the user drops a card before the main
- **THEN** the new order is saved but the main remains displayed first

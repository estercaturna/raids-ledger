## Why

Item level alone does not reflect how strong a character really is. Players want to record each character's combat power (CP), see it next to the item level, and have CP decide which cards are highlighted as strongest.

## What Changes

- Add an optional `cp` (combat power) number to each character, settable when adding a character (landing page roster, add form) and when editing.
- Show CP on its own line below the class and item level, as `CP · 6772`, on current-week cards.
- Highlight ranking (MAIN gold card, then purple/pink) uses CP descending; characters without CP, and ties, fall back to item level, then roster order.
- Add a D1 migration for the new nullable column; existing characters keep `cp = NULL` and behave as before.

Out of scope: using CP for raid eligibility, history cards, and any per-tracker settings.

## Capabilities

### New Capabilities
- `character-combat-power`: optional CP per character, shown on cards and used to rank highlights.

### Modified Capabilities

## Impact

- `migrations/0004_character_cp.sql`: nullable `cp` column.
- `src/validation.ts`, `src/index.ts`: accept, store, and return `cp`.
- `public/landing.js`, `public/tracker.html`, `public/tracker.js`, `public/style.css`: CP inputs and display, ranking by CP.
- `test/`: validation and API tests.
- Refines the ranking of the unarchived `character-highlight` change, which ranks by item level only.

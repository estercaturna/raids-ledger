## Why

With many characters, the strongest ones are hard to spot. Highlighting by item level makes the top character (MVP) and the next strongest instantly recognizable, for every tracker.

## What Changes

- In the current-week view, rank characters by `ilvl` descending.
- The top character (MVP) gets a gold outline on its card and its name and item level number are shown in gold.
- The next two characters get a purple/pink outline.
- Highlights are computed client-side from existing data; no API or schema change.

Assumption: "other strong accounts" means the 2 characters after the MVP (not yet confirmed by the user; adjustable via a single constant).

Out of scope: manual tiers, highlighting in history cards, per-tracker settings.

## Capabilities

### New Capabilities
- `character-highlight`: item-level based highlight of the MVP and next strongest characters.

### Modified Capabilities

## Impact

- `public/tracker.js`: compute ranks and add CSS classes to cards.
- `public/style.css`: gold and purple/pink outline styles.
- `test/`: none required for pure styling beyond the ranking helper if extracted.

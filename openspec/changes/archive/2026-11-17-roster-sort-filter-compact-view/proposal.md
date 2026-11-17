## Why

Rosters can have many characters (7+). Finding the strongest ones, seeing only who earns gold, or scanning everything at once requires a lot of scrolling through large cards. The UI also feels static when clearing raids.

## What Changes

- Add a view toolbar to the current-week roster: **Sort** (Roster order / Item level / Combat power) and a **Gold earners only** filter.
- Add light animations (progress bar fill, gold value change, card hover/enter), disabled under `prefers-reduced-motion`.
- View preferences are client-side only, remembered per tracker in `localStorage`; they never change the stored roster order.
- Drag-to-reorder stays active under any sort/filter; a drop moves only the dragged character in the stored order.
- No API or database changes.

## Capabilities

### New Capabilities
- `roster-view-options`: sorting, earner filter and motion preferences for the roster view.

### Modified Capabilities
<!-- none: existing requirements are unchanged -->

## Impact

- `public/tracker.html` (view controls), `public/tracker.js` (render pipeline, preferences), `public/style.css` (animations).
- README feature notes.
- No server, schema or API changes.

## Context

`public/tracker.js` builds each character card (`article.card`) from `state.characters`, which already includes `ilvl`. Styles are in `public/style.css`. Roster order is the user's drag order.

## Goals / Non-Goals

**Goals:**
- Gold MVP and purple/pink next-two outlines, by ilvl, for all trackers.

**Non-Goals:**
- Manual tiers, history highlighting, server changes.

## Decisions

- **Client-side ranking**: sort a copy of the characters by ilvl desc (stable, so ties keep roster order) and map ids to ranks; no API change because data is already present.
- **Constant `HIGHLIGHT_COUNT = 2`** for the purple/pink tier, easy to change.
- **CSS classes** `card--mvp` (gold outline, and gold color on its name `h2` and `.ilvl` span) and `card--strong` (purple/pink gradient border via outline/box-shadow so layout and drag styles are unaffected).
- Re-rank whenever the roster re-renders, so ilvl edits update highlights.

## Risks / Trade-offs

- Gold/purple outline must stay visible with the `.dragging` style; use `box-shadow` rather than `border-color`.
- The count of strong characters is an assumption; adjusting it is a one-line change.

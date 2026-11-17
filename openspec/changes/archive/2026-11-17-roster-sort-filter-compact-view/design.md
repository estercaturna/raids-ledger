## Context

Cards are rendered in `render()` from `state.characters`; ranking helpers (`highlightTiers`) and `goldEarner` already exist client-side. History weeks render via `historyCard`.

## Goals / Non-Goals

**Goals:** client-only sort/filter/animations, persisted per tracker.
**Non-Goals:** server-side sorting, changing stored order, API changes, applying sort/filter to past weeks beyond reusing the same pipeline where trivial.

## Decisions

- **View state in `localStorage`** keyed `view:<token>` as `{sort, earnersOnly}`; no server persistence (it is a device preference).
- **Render pipeline:** `visibleCharacters()` copies `state.characters`, applies filter then stable sort; `highlightTiers` still uses the full roster so MVP/strong badges stay consistent.
- **Roster totals** keep using all characters (filter is display-only), so numbers never change when filtering.
- **Drag stays enabled.** `saveOrder` currently persists the full DOM order, which is wrong when the DOM is sorted/filtered. Instead, on drop it computes the new full order by removing the dragged id from `state.characters` and reinserting it before the id of the next visible card (or after the previous one if dropped last), then sends that via `PUT /order`. Hidden and other characters keep their relative order. In a sorted view the card may snap back visually, since the sort still governs display; this is acceptable.
- **Animations** are CSS transitions (bar width, card hover/enter keyframe) wrapped so `@media (prefers-reduced-motion: reduce)` disables them.
- Controls live in the existing toolbar, collapsing onto a second row on small screens.

## Risks / Trade-offs

- Filtering while the empty-state message is shown: show "No characters match" when the filter hides everyone.

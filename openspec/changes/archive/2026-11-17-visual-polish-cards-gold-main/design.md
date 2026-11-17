## Context

Styles live in `public/style.css`; cards are built in `public/tracker.js` (`characterCard`, `raidChip`, `setGoldLines`, `updateRoster`). A reviewed preview exists at `/tmp/preview` (not part of the repo); its `preview.css` is the visual reference.

## Goals / Non-Goals

**Goals:** port the approved look into the real stylesheet with minimal markup changes.
**Non-Goals:** mobile tuning, landing page, new functionality, API changes.

## Decisions

- **CSS first.** Fold the preview rules into `style.css`, replacing overlapping rules instead of appending an override block. Keep the existing color variables and add `--gold`.
- **Class ring:** set `--class-color` on the avatar from the existing `classColor(groups, cls)` helper in `common.js` (already archetype-based), so no new color table.
- **Difficulty accent:** add a `d-<difficulty>` class to the raid label (it already knows `raid.difficulty`) and update it when the difficulty changes (the card is re-rendered after the change).
- **Main frame on hover:** `.card:hover` must not override the main's shadow, so add an explicit `.card--mvp:hover` rule with equal or higher specificity.
- **Crown:** an inline SVG data-URI as a background layer of the badge (`::before`), left of the text, filled with the badge text color; no emoji, so it renders crisply everywhere.
- **Main shine:** animate `background-position` of a `::after` gradient inside the card box. A moving transformed layer leaks outside the card once `overflow: hidden` is removed (needed so the badge can sit on the outline), so avoid transforms.
- **Orbiting light:** a `::after` with `inset: -2px; padding: 2px`, a `conic-gradient(from var(--angle) ...)` masked to the ring, and `@property --angle` animated 0 → 360deg over about 4s. The static outline stays underneath.
- **Roster tiles:** remove the `.roster` box styling; each `.stat` carries the gold border.
- **Reduced motion:** a single `@media (prefers-reduced-motion: reduce)` block that disables animations, transitions and the hover lift.

## Risks / Trade-offs

- `@property` and mask-composite need a modern browser; unsupported browsers fall back to the static outline (no animation), which is acceptable.
- The pulse/shine layers are `pointer-events: none` so they never block clicks on card buttons.
- `style.css` also changes in `roster-sort-filter-compact-view`; apply that change first or resolve overlaps when merging.

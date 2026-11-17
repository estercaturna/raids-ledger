## 1. View state

- [x] 1.1 Add view controls to `public/tracker.html` (Sort select, "Gold earners only" checkbox)
- [x] 1.2 Load/save `{sort, earnersOnly}` in `localStorage` per tracker token

## 2. Rendering

- [x] 2.1 Add `visibleCharacters()` (filter, stable sort by ilvl/CP with null-CP last) and use it in `render()`; keep tiers and roster totals based on the full roster
- [x] 2.2 Show "No characters match" when the filter hides everyone
- [x] 2.3 Make `saveOrder` move only the dragged id (relative to its visible neighbour) in the full roster order, so drag works with sort/filter active
- [x] 2.4 Hide controls for past weeks if they do not apply

## 3. Style and motion

- [x] 3.1 Add transitions (progress bar, gold values, card enter/hover) and disable under `prefers-reduced-motion`

## 4. Strength ranking

- [x] 4.0 Rank MVP/strong highlights and the item level sort by ilvl desc, then CP desc (null last), then roster order

- [x] 4.1 Always display the main (MVP) as the first card, after filter and sort

## 5. Wrap-up

- [x] 5.1 Update README feature notes
- [x] 5.2 Run typecheck/tests and verify visually with 7+ characters

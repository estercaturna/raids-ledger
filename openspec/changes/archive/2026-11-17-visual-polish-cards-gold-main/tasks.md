## 1. Cards and background

- [x] 1.1 Restyle `.card` (radius, gradient, shadow, hover lift) and the page background in `public/style.css`
- [x] 1.2 Set `--class-color` on the avatar in `characterCard` using `classColor` and style the ring
- [x] 1.3 Thicker progress bar with glow

## 2. Raids and gold

- [x] 2.1 Add `d-<difficulty>` class to raid labels in `raidChip` and style the left accent, round check and cleared state
- [x] 2.2 Style gold tiles with coin marker, larger values and highlighted Total; grey for non-earners
- [x] 2.3 Remove the `.roster` wrapper box and give each `.stat` a gold border

## 3. Main and strong highlights

- [x] 3.1 Main card: keep gold frame on hover, "MAIN" badge on the outline line with a small inline SVG crown (no emoji), contained shine
- [x] 3.2 Strong cards: orbiting purple/pink light with `@property --angle`, static outline kept

## 4. Motion and wrap-up

- [x] 4.1 Add the `prefers-reduced-motion` block covering all new animations and the hover lift
- [x] 4.2 Compare against the preview, run typecheck/tests and verify visually (including past weeks and a non-earner card)

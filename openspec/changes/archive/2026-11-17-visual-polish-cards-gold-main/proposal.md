## Why

The tracker works well but looks plain. A visual pass on the cards, raid chips, gold figures and the main/strong highlights makes the roster easier to scan and more in tune with the game's look. A throwaway preview was reviewed and approved by the user.

## What Changes

- **Cards:** softer corners and shadows, a lift on hover, and an avatar ring tinted by the class archetype color.
- **Raid chips:** a left accent bar by difficulty (Normal, Hard, Nightmare, Matching), round check with glow, green gradient when cleared.
- **Gold:** a coin marker beside the figures, larger numbers, the Total tile highlighted in gold; non-earners show a greyed coin.
- **Roster totals:** the two totals become separate gold-bordered tiles, without the wrapping box.
- **Main card:** gold frame kept on hover, the "MAIN" badge stays on the outline line with a small SVG crown, and a slow shine that stays inside the card.
- **Strong cards (2nd and 3rd):** a purple/pink light travels around the outline, on top of the static outline.
- **Page background:** deeper gradient with a faint dotted texture.
- All motion is disabled under `prefers-reduced-motion`.
- No API, data or behavior changes; mobile and the landing page are out of scope.

## Capabilities

### New Capabilities
- `visual-style`: look and motion of cards, raid chips, gold figures, roster totals and the main/strong highlights.

### Modified Capabilities
<!-- none: character-highlight and gold-breakdown requirements keep their meaning; only presentation changes -->

## Impact

- `public/style.css` (bulk of the change), `public/tracker.js` (avatar color variable, difficulty class on raid chips), possibly `public/tracker.html` (no markup change expected).
- Depends on the active `roster-sort-filter-compact-view` change for the pinned-main and strength-order behavior it styles; no code conflict beyond `style.css` ordering.

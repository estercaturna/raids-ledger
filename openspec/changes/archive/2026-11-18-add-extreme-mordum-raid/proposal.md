# Proposal

## Why

The 18 Nov 2026 Lost Ark update adds Kazeros Raid: Act 3 Extreme (Mordum), a time-limited raid that pays gold on top of the weekly 3-raid limit and even to characters that are not gold earners. The tracker cannot represent it today: every raid counts towards the top-3 gold cut, so ticking Mordum would either be ignored or displace a regular raid.

## What Changes

- Add Act 3 Extreme (Mordum) to the raid table: Normal (item level 1,730, 20,000 gold) and Hard (item level 1,770, 50,000 gold). Nightmare was removed by the developers and is not added.
- Introduce "event raids": raids flagged as extra and active only inside a date window (Act 3 Extreme: 18 Nov to 16 Dec 2026).
- Event raid gold is added on top of the weekly total: it is not part of the top-3 cut and not part of the 6 gold earners rule, so it counts for any character that clears it.
- Show event raids in their own labelled section of the character card, outside the `n/3` counter, and make "Mark all" ignore them.
- Outside its window an event raid is no longer offered for new weeks; clears already recorded stay in history with their gold.
- Enforce the in-game limit of 1 entry per roster per week: once any character has cleared an event raid in a week (Normal or Hard), no other character of the tracker can tick it that week, in the interface and in the API.
- Treat the Mordum gold as roster gold (bound = 0) for now: the official patch notes do not say whether it is character-bound. Revisit if confirmed otherwise.

Out of scope: Denouement Extreme (16 Dec 2026 to 13 Jan 2027) is not added here because its item levels and gold are not published yet, but the event-raid table makes it a data-only addition.

## Capabilities

### New Capabilities
- `event-raids`: time-limited raids that sit outside the weekly gold limits: availability window, separate display, extra gold on top of the weekly total, and history behaviour after the window ends.

### Modified Capabilities
- `raid-eligibility`: weekly gold total excludes event raids from the top-3 cut and adds them on top.
- `gold-earner-limit`: event raid gold is paid even to characters that are not gold earners.
- `clear-tracking`: the 3-clear weekly limit and "mark all" apply to regular raids only.
- `gold-breakdown`: card totals include event raid gold on top of the top-3 raids.

## Impact

- `src/raids.ts`: new raid entries plus an event flag and window; `weeklyGold` and `weeklyBoundGold` handle event raids separately.
- Tracker API and UI (`src/index.ts`, `public/tracker.js`, `public/style.css`): event section, counter and "Mark all" behaviour, roster totals.
- Tests in `test/raids.test.ts`. No database migration expected (clears are keyed by raid and difficulty).
- Sources: official patch notes at playlostark.com (Echoes of Thunder) and Inven Global.

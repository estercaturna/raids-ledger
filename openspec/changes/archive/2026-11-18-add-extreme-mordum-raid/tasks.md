# Tasks

## 1. Event raid data and gold logic

- [x] 1.1 Add the optional `event` window to `RaidEntry`, add Mordum Normal (1730, 20,000) and Hard (1770, 50,000) with window 2026-11-18 to 2026-12-09, and make `eligibleRaids` ignore event entries; verify existing `test/raids.test.ts` still passes
- [x] 1.2 Add `eligibleEventRaids(ilvl, week, table, prefs)` returning available event raids with options and default difficulty; add unit tests for inside window, before and after window, below ilvl, and Normal vs Hard default
- [x] 1.3 Make `weeklyGold`/`weeklyBoundGold` ignore event keys and add `weeklyEventGold`/`weeklyEventBound`; add unit tests for the 162,000 and 204,000 spec scenarios and for no displacement of regular raids

## 2. API

- [x] 2.1 Return `eventRaids` (with `cleared` and `lockedBy`) from `GET /api/t/:token` and combine regular and event gold per character, paying event gold to non-earners; verify with an API test for a non-earner with an event clear
- [x] 2.2 Allow event raid keys in `PUT /clears` for the current week only, outside the 3-clear limit, and reject a second character with `409 roster_limit_reached`; add API tests for limit bypass, second-character block, unmark freeing the entry, and out-of-window `not_eligible`
- [x] 2.3 Verify `POST /mark-all` and `PUT /prefs` leave event raids alone, and include event gold in `GET /history` totals; add API tests including a past week and a window that has ended

## 3. Tracker UI

- [x] 3.1 Render the Event section in `public/tracker.js` and `style.css` (label with end date, EVENT tag, difficulty selector, locked state with note), outside the `n/3` counter; verify manually in the dev server against the mockup
- [x] 3.2 Add event gold to card totals and roster totals client-side and disable the checkbox when `lockedBy` is set; verify toggling updates totals without reload and Mark all leaves the event raid unchanged

## 4. Docs and final check

- [x] 4.1 Update README features and the in-code gold source comment in `src/raids.ts` to mention event raids and the Mordum source; verify README renders the new bullet
- [x] 4.2 Run `npm test` and `openspec validate add-extreme-mordum-raid` and verify both pass

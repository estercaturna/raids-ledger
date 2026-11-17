# Tasks

## 1. Raid data and Matching Mode

- [x] 1.1 In `src/raids.ts`, add `"matching"` to `Difficulty`, `LABELS` ("Matching") and `RANK` (-1), add the `belgardin` matching row (1750, gold 50000, bound 25000), remove `bound` from Belgardin Normal, and comment that only Matching Mode pays 50% bound and that Hard/Nightmare bound is assumed 0; verify `npm run typecheck` passes.
- [x] 1.2 Add tests in `test/raids.test.ts`: Matching is listed in `options` but never the default, Normal stays the default at ilvl 1750, a stored `matching` preference is used, Matching clear gives 25,000 bound and Normal gives 0; verify `npm test` passes.
- [x] 1.3 Add a test in `test/api.test.ts` that `PUT /prefs` accepts `matching` for Belgardin at ilvl 1750 and rejects it below 1750; verify `npm test` passes.

## 2. Card gold lines

- [x] 2.1 In `public/tracker.js` (`characterCard`, `updateProgress`), replace the single "this week" line with "Character gold" and "Total gold" lines fed by `weekBound` and `weekGold`, keeping the 3-raid limit tooltip; verify manually that ticking raids updates both values and that Mark all updates them.
- [x] 2.2 In `historyCard`, show Character gold and Total gold from `weeklyBound` and `weeklyGold`; verify manually that a past week shows both.
- [x] 2.3 Add `.matching` to the difficulty selector styles in `public/style.css`, and adjust the card CSS so the two gold lines fit; verify manually at desktop and narrow widths that the Matching option does not widen the chip and nothing wraps badly.

## 3. Docs

- [x] 3.1 In `README.md`, mention Matching Mode, the 100% roster assumption for the other Belgardin difficulties, and the card gold lines in Features and the raid data note; verify the text matches the table.
- [x] 3.2 Run `npm test`, `npm run typecheck` and `openspec validate belgardin-matching-and-card-totals`; verify all pass.

## Workflow follow-up

- Before merging, confirm Hard and Nightmare Belgardin bound gold with Gate Info in game and update the table if it is not 0.
- Archive the change after review.

# Tasks

## 1. Stale clears on difficulty change

- [x] 1.1 In `src/index.ts` `PUT /prefs`, after saving the preference, delete the character's current-week `clear` rows for other difficulties of the same raid (keys taken from `RAIDS`); add tests in `test/api.test.ts` that switching Serca Nightmare to Hard removes the Nightmare clear, leaves other raids and past weeks untouched, and that reselecting the same difficulty keeps the clear; verify `npm test` passes.

## 2. Gold earner limit

- [x] 2.1 In `src/raids.ts`, add `GOLD_EARNERS_PER_ROSTER = 6` and a pure function returning the earner ids (ilvl desc, cp desc with null last, position asc); add tests in `test/raids.test.ts` for 6 or fewer characters, a 7th character, the cp tie-break, the null-cp tie-break and the position fallback; verify `npm test` passes.
- [x] 2.2 In `src/index.ts`, add `goldEarner` to each character in `GET /api/t/:token` and `/history`, returning `weeklyGold` and `weeklyBound` as 0 for non-earners; add API tests that a 7-character roster zeroes the lowest character, that clears still show as cleared, and that raising its ilvl swaps the earners; verify `npm test` and `npm run typecheck` pass.
- [x] 2.3 In `public/tracker.js` and `public/style.css`, use 0 gold for non-earners in `updateProgress` so the roster totals count only earners, show a "no gold" hint on a non-earner card (current and history), keep its clears visible; verify manually with a 7-character tracker that totals count 6 characters and the hint appears only on the 7th.

## 3. Logo and docs

- [x] 3.1 In `public/logo.svg`, keep a single `href` on the embedded image and remove the duplicate `xlink:href`; verify the file is roughly half the size and the logo still renders in the favicon, landing header and tracker header.
- [x] 3.2 In `README.md`, note that only the 6 highest item level characters earn gold (ties by combat power, then roster order) and that changing a raid's difficulty drops the earlier clear; verify the text matches the specs.
- [x] 3.3 Run `npm test`, `npm run typecheck` and `openspec validate roster-gold-cap-and-stale-clears`; verify all pass.

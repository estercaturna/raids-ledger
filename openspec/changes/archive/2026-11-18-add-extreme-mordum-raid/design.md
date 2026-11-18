# Design

## Context

Raids live in the `RAIDS` table in `src/raids.ts`. `eligibleRaids` returns one entry per raid, `weeklyGold`/`weeklyBoundGold` take the top 3 by gold, and `goldEarnerIds` zeroes gold for characters outside the top 6. The API (`src/index.ts`) enforces the 3-clear limit in `PUT /clears` and fills slots in `POST /mark-all`; `public/tracker.js` mirrors the top-3 gold rule client-side for optimistic updates. Clears are stored as `(character_id, week_start, raid_key)`, so an event raid needs no new table. See proposal.md for scope and specs/event-raids for behavior.

## Goals / Non-Goals

**Goals:**
- Event raids are data in the same table, so adding Denouement Extreme later is a data-only change.
- Existing regular-raid logic and its tests keep working unchanged.

**Non-Goals:**
- No database migration, no per-event settings UI, no automatic fetching of game data.
- No change to how regular raids, difficulty preferences or the Belgardin matching mode work.

## Decisions

**1. `event` window on `RaidEntry`.** Add `event?: { fromWeek: string; toWeek: string }` (inclusive `YYYY-MM-DD` of the first and last Wednesday). A raid is available for a week when `week.slice(0, 10)` is inside the window. Alternative: a separate `EVENT_RAIDS` array. Rejected: duplicates difficulty ranking, labels and gold lookup (`goldForKey`), and `raidKey` is shared anyway.

**2. Regular and event raids are split at the source.** `eligibleRaids` ignores entries with `event`, so the 3-clear limit, `mark-all`, `topGold` and every existing test stay untouched. A new `eligibleEventRaids(ilvl, week, table, prefs)` returns the available event raids with the same shape (options, default difficulty, label). Alternative: keep one list and filter with a flag everywhere. Rejected: easy to forget in one of the five places that count raids.

**3. Gold is computed in two parts.** `weeklyGold(keys)` and `weeklyBoundGold(keys)` ignore event keys; a new `weeklyEventGold(keys)` sums event keys (and `weeklyEventBound`). Call sites compute `earner ? regular : 0` plus the event part, so event gold is paid to non-earners. History looks keys up in the full table, so clears stay valued after the window ends. Alternative: add an `isEarner` argument to `weeklyGold`. Rejected: mixes the earner rule into a pure gold function.

**4. 1 entry per tracker per week is enforced in `PUT /clears`.** When ticking an event raid, query this week's clears of the tracker for any key of the same `raid` other than `(characterId, raidKey)`; if one exists return `409 { error: "roster_limit_reached" }`. Switching difficulty already removes the other difficulty's clear (`PUT /prefs`), so the same character can still change difficulty. The API also returns, per event raid, `lockedBy` (the character name holding the entry) so the UI can disable the checkbox without a second request. Alternative: a unique index in D1. Rejected: the key is per tracker and week across characters, which would need a new column and a migration.

**5. Eligibility checks use the week being clicked.** The clear and prefs endpoints use `currentWeek`, so an event raid outside its window gets `not_eligible` there. Past weeks are read-only already.

**6. UI.** `GET /api/t/:token` returns `eventRaids` per character next to `raids`. `tracker.js` renders them in an "Event · until <date>" section; `updateProgress` keeps counting only `ch.raids`, and adds the event gold on top of `topGold`. Clear-limit and `markAll` code paths do not read `eventRaids`. The tracker-wide totals include event gold.

**7. Data.** Mordum Normal (1730, 20,000) and Hard (1770, 50,000) with no `bound` (roster gold, as the patch notes do not say it is character-bound). Window `2026-11-18` to `2026-12-09`.

## Risks / Trade-offs

- [Bound vs roster gold unverified] → Defaults to roster gold per proposal; one-line data change if confirmed otherwise.
- [Reset hour vs maintenance time] → The window compares week-start dates, not instants, so the first and last weeks follow the tracker's existing Wednesday reset.
- [Entry limit can be bypassed by editing a character's item level down/up] → Same trust model as the rest of the tracker; clears are user-entered.
- [Client mirrors server gold rules] → Keep the event addition in one small function in `tracker.js` and cover the server side with tests.

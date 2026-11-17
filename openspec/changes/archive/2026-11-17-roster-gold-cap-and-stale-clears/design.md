# Design

## Context

Gold is derived at request time from `RAIDS`, per character (`weeklyGold`, `weeklyBoundGold`). `GET /api/t/:token` and `/history` return those per character; `tracker.js` sums them for the roster header. Characters have `ilvl`, `cp` (nullable) and `position`. History is derived from stored `clear` rows against the current roster and table. `PUT /prefs` only upserts `raid_pref`; `PATCH /characters/:id` intentionally keeps current clears when item level changes. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- A single server-side ranking decides who earns gold; the client trusts the flag.
- No schema change.

**Non-Goals:**
- User-chosen gold earners (decided: automatic by item level only).
- Cleaning clears after an item-level change.

## Decisions

- **Rank on the server, return `goldEarner`.** A pure function in `src/raids.ts` takes the characters (`ilvl`, `cp`, `position`) and returns the set of earner ids: sort by `ilvl` desc, `cp` desc (null last), then `position` asc, and take `GOLD_EARNERS_PER_ROSTER = 6`. Alternative: rank in `tracker.js`. Rejected: history and the current view would each re-implement it, and the API would disagree with the UI.
- **Zero the gold, keep the clears.** Non-earners keep their `raids` and `cleared` state; `weeklyGold` and `weeklyBound` are returned as 0 and `goldEarner: false`. Alternative: block clears for non-earners. Rejected: clears still matter to the user and the spec says they stay.
- **History uses the current ranking.** History already recomputes from the current roster and table, so applying the current earner set keeps one rule. Trade-off in Risks.
- **Stale clears removed in `PUT /prefs`.** After the upsert, delete current-week `clear` rows of that character whose `raid_key` belongs to the same raid and differs from `raidKey(raid, difficulty)`. Keys come from `RAIDS`, not string parsing. Past weeks are left alone, which is why only the current week is touched. Alternative: filter stale keys on read. Rejected: history and the 3-clear limit would need the same filter in several places.
- **Same-difficulty reselect is a no-op:** the delete targets other difficulties only, so reselecting the current choice removes nothing.
- **Client:** `updateProgress` uses 0 for non-earners (so the roster totals follow) and adds a "no gold" hint on the card; the existing gold tiles stay. The logo change is independent: drop `xlink:href` and keep `href`.

## Risks / Trade-offs

- [A character that was an earner in a past week but is now outranked shows 0 gold in that week] → Accepted; history is already derived from the current roster. A stored per-week earner list would fix it but needs a migration.
- [Stale clears are only fixed when the difficulty is changed through the selector] → Other paths (item-level edits) keep their documented behaviour.
- [Dropping `xlink:href` could break very old renderers] → Every current browser supports plain `href` on SVG `image`; verify the favicon, header and landing logo render.
- [`cp` is optional, so many rosters tie on item level with null `cp`] → The roster-order tie-break makes the result deterministic.

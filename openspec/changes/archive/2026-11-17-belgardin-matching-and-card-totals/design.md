# Design

## Context

Gold is derived at request time from the `RAIDS` table in `src/raids.ts`: `weeklyGold` and `weeklyBoundGold` pick the 3 highest-paying cleared raids. The API already returns `weeklyGold` and `weeklyBound` per character, current and history, and `tracker.js` already computes both in `updateProgress`. `difficulty` (`raid_pref`) and `raid_key` (`clear`) are plain `TEXT`, and `PUT /prefs` accepts only values listed in a raid's eligible `options`. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Model Matching Mode with the existing difficulty selector, without a new column or toggle.
- Show character and total gold on cards using values already computed.

**Non-Goals:**
- Matching Mode for raids other than Belgardin.
- Verifying Hard/Nightmare bound gold in-game; 0 is an assumption, changeable by editing the table.

## Decisions

- **Matching is a difficulty entry, not a flag.** Add `"matching"` to `Difficulty` with its own `RAIDS` row (`minIlvl` 1750, gold 50000, bound 25000), key `belgardin-matching`. Alternative: a per-clear boolean. Rejected: needs a migration, API changes and a new UI control, while the selector, persistence, eligibility checks and key-based gold already exist.
- **`RANK` below Normal** (`-1`). `eligibleRaids` defaults to the highest rank, so Matching is never chosen unless the user picks it, and `RANK`'s existing ordering of options keeps Matching first in the dropdown.
- **Label "Matching"** (8 characters, shorter than "Nightmare") so the chip width does not change. Add a `.matching` class for the selector colour.
- **Belgardin Normal bound removed.** The 50/50 split is documented only for Matching Mode. Add a comment on the Belgardin rows saying so.
- **Card totals reuse existing values.** Show `weekBound` as Character gold and `weekGold` as Total gold; no new API fields. The header's single "this week" line is replaced by the two lines. The `title` hint about the 3-raid limit moves to the Total gold line. History cards use `weeklyBound` and `weeklyGold` from the API.
- **Label wording:** "Character gold" and "Total gold" as the user requested. The roster header keeps "Character Gold total" and "Roster Gold total".

## Risks / Trade-offs

- [Past `belgardin-normal` clears lose their character gold, since history is recomputed from the table] → Accepted; noted in the proposal.
- [Hard/Nightmare bound assumed 0] → Documented in a table comment; one-line fix if the Gate Info in game shows otherwise.
- [A user who changes difficulty after clearing leaves a stale clear that still counts in history] → Pre-existing behaviour, out of scope.
- [Matching key `belgardin-matching` is a new `raid_key`; clears made before this change are unaffected] → None needed.

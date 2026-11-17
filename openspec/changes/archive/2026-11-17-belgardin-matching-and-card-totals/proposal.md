# Proposal

## Why

The Belgardin gold split is wrong for most clears. Only the Matching Mode pays 50% character-bound gold and 50% roster gold (official Arbiter of Death patch notes). The table assumes this for Normal and nothing for Hard/Nightmare, and Matching Mode cannot be selected. Character cards also show only one weekly gold number, so the user cannot see how much of it is character gold.

## What Changes

- Belgardin Normal, Hard and Nightmare are treated as 100% roster gold (no character-bound gold). Hard/Nightmare bound is unverified in-game and assumed to be 0.
- Add a **Matching** option to the Belgardin difficulty selector: Normal item level and gold (50,000), 25,000 character gold and 25,000 roster gold. It is never the default.
- Each character card shows **Character gold** and **Total gold** (character plus roster) for the week, using the same top-3 rule as today.
- Past-week cards show the same split.
- **BREAKING (data only):** past weeks with `belgardin-normal` clears recompute with 0 character gold, because gold is derived from the raid table, not stored.

## Capabilities

### New Capabilities
- `gold-breakdown`: character-bound versus roster gold per raid, and the weekly character and total gold on each character card, current and past weeks.

### Modified Capabilities
- `raid-eligibility`: the difficulty selector may offer Matching Mode, which is never the default.

## Impact

- `src/raids.ts`: `Difficulty`, `LABELS`, `RANK`, Belgardin rows.
- `public/tracker.js`: card gold lines, history card; `public/style.css`: `.matching` style.
- No API shape change (`weeklyGold` and `weeklyBound` already returned) and no migration (`difficulty` and `raid_key` are plain `TEXT`).
- `test/` and README raid notes.
- Out of scope: a per-clear matching toggle for other raids, and cleaning up stale clears after a difficulty change.

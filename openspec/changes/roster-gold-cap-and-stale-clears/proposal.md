# Proposal

## Why

Three gaps make the gold numbers and assets less accurate than they should be. In Lost Ark only 6 characters per roster earn gold each week, but the tracker sums every character, so the roster totals are inflated for rosters of 7 or more. Changing a raid's difficulty after clearing it leaves the old clear in the database, where it still counts in history. The logo file embeds its image twice.

## What Changes

- Only the 6 characters with the highest item level earn gold; ties are broken by combat power (higher first, no value last), then by roster order. All other characters count as 0 character gold and 0 total gold.
- Each character card shows whether it earns gold, and the roster totals (Character Gold total, Roster Gold total) and the past-week cards count only earning characters.
- Selecting a different difficulty for a raid removes that character's clear of the previous difficulty of the same raid from the current week, so it no longer counts anywhere.
- `public/logo.svg` embeds its image once instead of twice.
- **BREAKING (data only):** past-week gold for characters outside the top 6 recomputes as 0, because history gold is derived from the current roster, not stored.

## Capabilities

### New Capabilities
- `gold-earner-limit`: which characters of a roster earn gold in a week, and how that affects card, roster and history totals.

### Modified Capabilities
- `raid-eligibility`: changing a raid's difficulty drops the same week's clear of the previous difficulty.

## Impact

- `src/raids.ts`: roster-wide limit constant and the ranking rule; `src/index.ts`: ranking used by `GET /api/t/:token`, `/history`, and `PUT /prefs` (clear removal).
- `public/tracker.js`, `public/style.css`: earner flag on the card, zero totals for non-earners.
- API: each character in `GET /api/t/:token` gains a `goldEarner` boolean; history entries gain the same, with gold already zeroed.
- No migration: ranking is computed from existing `ilvl`, `cp` and `position`.
- `public/logo.svg`, README gold notes, `test/`.
- Out of scope: letting the user choose which characters earn gold; clearing stale clears when item level changes (`PATCH`), which intentionally keeps current clears.

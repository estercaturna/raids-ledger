## Why

The owner plays support and alternates with a partner each game week: one week the strongest accounts are paired with Phirk, the next with Skyfire, to keep damage balanced and fair. Today nobody can tell at a glance whose week it is. The label should be automatic and visible only on the owner's tracker.

## What Changes

- Show a "Current week: <name>" label that alternates every game week (Phirk, Skyfire, Phirk, ...), computed from the week start with no stored state.
- Show the label only when the request's token hash equals a configured hash (`WEEK_ROTATION_TOKEN_HASH`); every other tracker is unchanged.
- Add config for the anchor: a known week start and which name owns it. The current week (started 2026-11-11 10:00 UTC) belongs to Phirk.
- Past weeks listed in the week selector also show the correct name for the owner's tracker.
- Add the design note `docs/week-rotation-token-hash.md` (already written) as reference.

Out of scope: a manual override or clickable toggle, and history retention limits (handled separately).

## Capabilities

### New Capabilities
- `week-rotation-label`: automatic alternating "Current week" owner label, gated to one tracker by token hash.

### Modified Capabilities

## Impact

- `src/index.ts`: `authenticate` exposes whether the token hash matches; `GET /api/t/:token` and `/history` add rotation data.
- `src/week.ts`: helper to compute the rotation name for a week.
- `src/env.d.ts`, `wrangler.jsonc`: new vars.
- `public/tracker.js`, `public/tracker.html`, `public/style.css`: render the label and week names.
- `test/`: week helper and API tests.

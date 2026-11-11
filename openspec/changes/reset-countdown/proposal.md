## Why

Raid clears reset every Wednesday, and players plan around how long is left. The tracker shows the current week but not when it ends.

## What Changes

- The tracker page shows a live countdown to the next weekly reset (e.g. "Reset in 3d 4h 12m 5s") while viewing the current week.
- The API returns the next reset instant so the client does not guess the reset hour.
- The countdown is hidden when viewing a past week.

## Capabilities

### New Capabilities
- `reset-countdown`: shows the time left until the next weekly reset.

### Modified Capabilities
<!-- none -->

## Impact

- `src/index.ts`: add `nextReset` to `GET /api/t/:token`.
- `src/week.ts`: helper for the next reset instant.
- `public/tracker.html`, `public/tracker.js`, `public/style.css`: countdown element and ticking.
- No migration.

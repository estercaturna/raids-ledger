## 1. Storage and API

- [x] 1.1 Add `migrations/0005_rotation_override.sql` creating `rotation_override(tracker_id, week_start, name, PRIMARY KEY (tracker_id, week_start))`; verify with `npm run db:local`
- [x] 1.2 Make `weekRotation` accept the tracker's overrides, load them in `GET /api/t/:token` and `GET /history`, and return `rotation.options` and `rotationOverridden`; add API tests for default, override winning, and other tokens seeing nothing
- [x] 1.3 Add `PUT /api/t/:token/rotation` for the configured token only (set or clear, name must be a configured name, week must be a valid week not after the current one); add API tests for set, clear, unknown name, future week, invalid week, and 404 for other tokens

## 2. Tracker UI

- [x] 2.1 Turn the "Current week" pill in `public/tracker.js`, `tracker.html` and `style.css` into a Phirk / Skyfire / Automatic selector that acts on the viewed week (current or past) and refreshes; verify in the dev server that last week can be set to Skyfire and the current week keeps working

## 3. Docs and final check

- [x] 3.1 Mention the selector in `README.md`, then run `npm test`, `npm run typecheck` and `openspec validate override-week-rotation --strict` and verify all pass

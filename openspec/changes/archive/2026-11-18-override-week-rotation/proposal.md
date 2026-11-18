## Why

The "Current week: <name>" label alternates between Phirk and Skyfire purely by week parity. When the account whose turn it is does not play (Phirk skipped last week), the label is wrong and cannot be corrected without editing the config and redeploying. The owner needs to pick who plays a given week.

## What Changes

- Add a per-week override of the rotation name, stored for the configured tracker only.
- The automatic alternation stays the default. An override applies to that single week only and does not shift later weeks.
- The "Current week: <name>" label becomes a selector (Phirk, Skyfire, Automatic) on the configured tracker.
- Past weeks can be corrected the same way from the week view, so last week can be set to Skyfire.
- The configured names stay fixed (Phirk and Skyfire); no other names can be chosen.
- A new endpoint saves or clears the override; it is rejected for any other token.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `week-rotation-label`: the rotation name is no longer purely computed; a stored per-week override takes precedence, and the configured tracker can set or clear it.

## Impact

- `migrations/`: new D1 table for overrides.
- `src/index.ts`: apply overrides in `GET /api/t/:token` and `GET /history`, add `PUT /api/t/:token/rotation`.
- `public/tracker.js`, `public/tracker.html`, `public/style.css`: selector UI.
- `test/api.test.ts`: override tests. `README.md`: mention the selector.
- No change for trackers other than the configured one.

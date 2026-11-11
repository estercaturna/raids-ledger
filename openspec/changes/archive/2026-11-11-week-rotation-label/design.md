## Context

Trackers are opened by secret token; only `hashToken(token)` (SHA-256 hex) is stored. `authenticate` in `src/index.ts` already hashes the token on every `/api/t/:token/*` request. `weekStart()` in `src/week.ts` gives the Wednesday reset instant. Config lives in `wrangler.jsonc` `vars` (e.g. `RESET_HOUR_UTC`). See `docs/week-rotation-token-hash.md`.

## Goals / Non-Goals

**Goals:**
- Automatic, stateless alternation; label visible only for one configured token.
- Raw token never stored in code or config.

**Non-Goals:**
- Manual override or clickable toggle.
- Multi-tracker support or a database flag.
- Retention limits on history.

## Decisions

- **Gate by hash in config** (`WEEK_ROTATION_TOKEN_HASH`) instead of a DB column: no migration, owner-only, matches existing `vars` pattern. Alternative (tracker column) rejected as unnecessary for one user.
- **Stateless parity**: `weeks = round((weekStart - anchorWeek) / 7 days)`; even -> anchor name, odd -> other name, using a floor-mod so weeks before the anchor work. Vars: `ROTATION_ANCHOR_WEEK` (ISO instant of a week start), `ROTATION_ANCHOR_NAME` ("Phirk"), `ROTATION_OTHER_NAME` ("Skyfire"). Anchor: 2026-11-11T10:00:00.000Z = Phirk.
- **`authenticate` records `rotationEnabled`** (computed hash compared to config) in the context; `GET /api/t/:token` adds `rotation: { name }` and `/history` adds `rotationName` per week only when enabled. Other trackers get no extra fields.
- **UI**: `tracker.js` renders "Current week: <name>" near the week pill and appends the name to selector options when `rotation` is present.

## Risks / Trade-offs

- The hash is committed in config; it is not reversible for a 256-bit token but does identify the owner's tracker. Accepted.
- Misconfigured anchor flips the names; tests pin the anchor behavior.
- Changing `RESET_HOUR_UTC` shifts week starts; parity uses week-start differences so it stays consistent.

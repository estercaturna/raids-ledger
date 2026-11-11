## 1. Rotation logic

- [x] 1.1 Add `rotationName(weekStart, anchorWeek, anchorName, otherName)` to `src/week.ts` using floor-mod week parity
- [x] 1.2 Add vars (`WEEK_ROTATION_TOKEN_HASH`, `ROTATION_ANCHOR_WEEK`, `ROTATION_ANCHOR_NAME`, `ROTATION_OTHER_NAME`) to `src/env.d.ts` and `wrangler.jsonc`; compute the owner's token hash locally per `docs/week-rotation-token-hash.md` (never commit the token)

## 2. API

- [x] 2.1 In `authenticate`, set a context flag when the token hash equals `WEEK_ROTATION_TOKEN_HASH` and all rotation vars are present
- [x] 2.2 Add `rotation: { name }` to `GET /api/t/:token` and `rotationName` to each `/history` week only when the flag is set

## 3. UI

- [x] 3.1 Render "Current week: <name>" in `public/tracker.html`/`tracker.js` and style it in `public/style.css`
- [x] 3.2 Append the rotation name to week-selector options when present

## 4. Tests

- [x] 4.1 Unit tests for `rotationName` (anchor, next week, before anchor)
- [x] 4.2 API tests: matching token shows rotation, other token and unconfigured show none

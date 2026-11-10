# Tasks

## 1. Project setup

- [x] 1.1 Scaffold Worker project (TypeScript, Wrangler, Hono, Vitest workers pool); verify `npm test` and `wrangler dev` start
- [x] 1.2 Create D1 database and initial migration (tracker, character, clear tables); verify `wrangler d1 migrations apply --local` succeeds

## 2. Raid eligibility and week logic (pure functions)

- [x] 2.1 Add `RAIDS` requirements table and eligibility function (highest difficulty per raid); verify unit tests for boundary ilvl, below-threshold, and multi-difficulty cases pass
- [x] 2.2 Implement week-start (Wednesday reset) function with configurable reset instant; verify unit tests around the boundary and across weeks pass

## 3. Roster management

- [x] 3.1 Implement shared input validation (name, class, ilvl range, unique names); verify unit tests cover valid, empty, out-of-range and duplicate cases
- [x] 3.2 Implement `POST /api/trackers` (characters → tracker + secret token, hash stored); verify test: success and invalid input creates no tracker
- [x] 3.3 Implement add/edit/remove character endpoints preserving existing clears; verify test that an ilvl update recomputes eligibility and keeps current clears

## 4. Secret link access and clear tracking

- [x] 4.1 Implement token auth middleware (hash lookup, 404 on unknown, no-store/no-referrer headers) and confirm no listing endpoints exist; verify tests
- [x] 4.2 Implement `GET /api/t/:token` returning characters, eligible raids and current-week clears; verify test
- [x] 4.3 Implement clear toggle and mark-all (per character and tracker-wide) endpoints, idempotent; verify tests incl. repeated requests

## 5. Weekly history

- [x] 5.1 Implement history endpoint listing past weeks and clears per week (read-only); verify test that a week boundary yields an empty current week and preserved prior week

## 6. Front end

- [x] 6.1 Build landing page (manual character entry form, error states) and tracker page (characters, eligible raids, checkboxes, mark-all, secret link display with privacy notice); verify manually in `wrangler dev`
- [x] 6.2 Add optimistic toggle with revert on failure and a history week selector; verify manually by simulating a failed request and viewing a previous week

## 7. Deployment and docs

- [x] 7.1 Document setup, secrets, migrations, and raid table updates in README.md; verify a fresh clone can follow it to run locally
- [x] 7.2 Deploy to Cloudflare (remote D1 migration, secret set) and verify end-to-end: create tracker, clear on one device, visible on another via the link

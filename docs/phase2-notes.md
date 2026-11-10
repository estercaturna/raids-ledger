# Phase 2 notes: local app that detects clears

Phase 2 was left out of the Phase 1 proposal. This file is the starting point for it.

## Goal

A local app (runs on the player's PC) that detects raid clears in Lost Ark and marks them in the tracker automatically, so nobody ticks boxes by hand.

## What Phase 1 already provides

The tracker API is deployed at `https://raids-ledger.trackertools.workers.dev`. The local app can reuse it as is.

- Auth is the secret token from the tracker link (`/t/<token>`). It is sent in the URL path, with no login and no API key. The app needs the user to paste their tracker link once and store the token locally.
- Mark or unmark a clear: `PUT /api/t/:token/clears` with `{ "characterId": number, "raidKey": string, "cleared": boolean }`.
  - `raidKey` is `<raid>-<difficulty>`, for example `serca-nightmare` or `horizon-cathedral-stage-3`. The valid keys are in `src/raids.ts`.
  - `400 not_eligible`: the character's ilvl or chosen difficulty doesn't allow that raid.
  - `409 limit_reached`: the character already has 3 clears this week.
- Read the state: `GET /api/t/:token` returns the week start, the characters, their eligible raids (with `cleared`) and gold.
  - Use it to map a character name to its `characterId`.
- Other endpoints: `POST/PATCH/DELETE .../characters`, `PUT .../prefs` (difficulty), `PUT .../order`, `POST .../mark-all`, `GET .../history`.

## Rules to respect

- The week resets on Wednesday at 10:00 UTC (`RESET_HOUR_UTC`). The server decides the week, so the app doesn't send one.
- Only 3 raids per character count for gold. The server enforces this.
- Setting a clear is idempotent: marking an already cleared raid is a no-op.

## Open questions for Phase 2

- Detection source. The official Open API is KR-only (see `lost-ark-api-region-findings.md`), so it can't be used for EU. Candidates to evaluate:
  - Reading the game's combat log files, if the game writes them locally. Check what the log contains and whether it's allowed.
  - Screen or OCR detection of the clear screen. More fragile.
  - A third-party tool's output that the user already runs.
- Terms of service. Anything that reads game memory or injects into the game process is off the table. Prefer files the game writes itself, and check the publisher's rules first.
- Mapping the detected raid and difficulty to a `raidKey`, and the detected character name to a `characterId`.
- Packaging and platform: Windows only? Tray app, CLI or desktop UI? Language (TypeScript/Node fits the existing stack).
- Safety: store the tracker token locally, and never log it.
- Offline handling: queue the clears and send them later.

## Suggested first steps

1. Start a new OpenSpec change for Phase 2 (`/openspec-propose`), covering only the local detector.
2. Spike the detection source first (like the API-region check in Phase 1), before building anything else.
3. Keep the server changes small. The existing `PUT /clears` may be enough.

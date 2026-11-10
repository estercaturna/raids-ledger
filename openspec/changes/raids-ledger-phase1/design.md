# Design

## Context

Greenfield repository (only README). Stack is fixed: TypeScript on Cloudflare Workers with D1. See proposal.md for scope. The official Lost Ark Open API only serves Korean data (tested: EU characters return `[]`), so the roster is entered manually.

## Goals / Non-Goals

**Goals:**
- Single Worker serving both the JSON API and the static front end.
- Eligibility and week calculation as pure, unit-testable functions.
- Safe to evolve: raid table and reset time live in data/config.

**Non-Goals:**
- Accounts, sharing/permissions beyond the secret link, token rotation UI (Phase 1).
- Automatic clear detection (Phase 2).
- Background syncing of ilvl; refresh is user-initiated.

## Decisions

- **Worker + static assets, plain TS front end (no heavy framework).** Small UI (list of characters, checkboxes). Alternative: React/Vite — more tooling than needed; can be adopted later.
- **Raid and class data:** only current raids (Armoche, Kazeros, Serca, Horizon Cathedral, Belgardin) live in `src/raids.ts`; Horizon Cathedral uses stages instead of difficulties. Classes live in `src/classes.ts` and are exposed through `GET /api/meta` so the UI renders a grouped class dropdown. Sources: Maxroll and Smilegate/Inven; verify after patches.
- **Router: Hono.** Lightweight, typed, first-class Workers support. Alternative: hand-rolled routing.
- **D1 schema:** `tracker(id, token_hash, created_at)`, `character(id, tracker_id, name, class, ilvl, updated_at)`, `clear(character_id, week_start, raid_key, cleared_at)` with a unique key on `(character_id, week_start, raid_key)`. Cleared = row exists; unmark = delete. "Mark all" is one batched insert.
- **Secret token:** 128+ bits from `crypto.getRandomValues`, base64url, in the URL path (`/t/<token>`). Only a SHA-256 hash is stored, so a DB leak does not expose links. Responses use `Referrer-Policy: no-referrer` and `Cache-Control: no-store`. Alternative: store raw token — simpler, weaker.
- **Week derivation, not cron-driven reset.** `week_start` is computed from request time as the most recent Wednesday reset instant (default 10:00 UTC, configurable constant). Clears are keyed by `week_start`, so "reset" is implicit and history is just earlier keys. Alternative: cron deleting/archiving rows — fragile if missed and loses nothing extra. No scheduled trigger needed.
- **History semantics:** past weeks store only raw clears (`raid_key` includes difficulty, e.g. `armoche-hard`), so they remain correct after ilvl changes. Retention: keep all (volume is tiny).
- **Manual roster entry; no external API.** Characters are created and edited through the Worker API and stored in D1. Alternative: official API (KR-only) or third-party scraping (fragile, terms risk). Automatic import can be added later behind a roster-source interface; not built now.
- **Eligibility:** static `RAIDS` table (key, name, difficulty, minIlvl, gate count); function returns highest eligible difficulty per raid. Values must be verified against current game data when implemented.
- **Testing:** Vitest with `@cloudflare/vitest-pool-workers` (real D1 locally); pure-function tests for eligibility and week math.

## Risks / Trade-offs

- [Manual entry means ilvl can go stale] → Easy inline ilvl edit; eligibility recomputed immediately.
- [Secret link leaked = full access] → High-entropy tokens, hashed at rest, no-referrer; documented limitation of no-login design.
- [Input validation gaps (bad ilvl, duplicate names)] → Validate server-side with a shared schema; covered by tests.
- [Raid table goes stale with game patches] → Data-driven table, single file to update.
- [Reset-time assumption wrong for a region] → Single configurable constant, covered by tests.
- [Concurrent clicks from two devices] → Idempotent insert/delete per cell avoids conflicts.

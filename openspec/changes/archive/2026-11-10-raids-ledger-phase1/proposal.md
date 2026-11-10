# Proposal

## Why

Lost Ark players with several characters must remember, every week, which raids each character is eligible for and which they have already cleared. Today this is done by hand in spreadsheets. A small web tool that shows eligible raids per character and tracks clears removes the manual bookkeeping. The official Lost Ark Open API only returns Korean-service data (verified: EU characters return an empty list), so characters are entered manually.

## What Changes

- New web site "raids-ledger" (Phase 1), written in TypeScript and hosted on Cloudflare Workers with D1 storage.
- The user enters their characters manually (name, class picked from a fixed list, item level / ilvl) and can edit them later. Only current endgame raids are tracked: Armoche, Kazeros, Serca, Horizon Cathedral and Belgardin (Shadow Raid).
- For each character, the site shows the raids whose ilvl requirement the character meets.
- Each eligible raid has a one-click clear checkbox per character, plus a "mark all" action.
- Clears reset weekly on Wednesday; past weeks are kept as browsable history.
- State is persisted server-side and accessed through a secret link (unguessable URL token). There is no login or account system.

Out of scope: Phase 2 (local app that detects clears automatically), automatic roster import (KR-only official API; can be added later), user accounts, notifications, gold/loot tracking.

## Capabilities

### New Capabilities
- `roster-management`: Manually creating and editing the character roster (name, class, ilvl).
- `raid-eligibility`: Determining which raids (and difficulties) each character is eligible for from its ilvl.
- `clear-tracking`: Marking raid clears per character with one click, and bulk "mark all".
- `weekly-reset-history`: Weekly Wednesday reset of clear state and retention/viewing of past weeks.
- `secret-link-persistence`: Server-side persistence of a tracker, addressed by a secret link with no login.

### Modified Capabilities

(none — greenfield project)

## Impact

- New codebase: Worker (API + static front end) and D1 schema and migrations. No scheduled trigger and no external API dependency.
- Security: secret link tokens are the sole access control and must be unguessable.

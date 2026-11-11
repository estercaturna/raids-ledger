## Context

Characters live in the D1 `character` table (`name`, `class`, `ilvl`, `position`); `validateCharacter` in `src/validation.ts` is shared by roster creation, add, and edit. The landing page (`public/landing.js`) builds the initial roster; `public/tracker.html`/`tracker.js` handle add/edit. Highlights come from `highlightTiers` in `public/tracker.js`, currently by item level.

## Goals / Non-Goals

**Goals:**
- Optional CP stored per character, entered at creation and edit, shown with ilvl.
- Highlight ranking by CP with ilvl fallback.

**Non-Goals:**
- Raid eligibility based on CP; history cards; CP maximum tied to game rules.

## Decisions

- **Nullable integer column** `cp` via `0004_character_cp.sql` (`ALTER TABLE character ADD COLUMN cp INTEGER`); existing rows stay NULL, no backfill.
- **Validation**: `cp` optional; if present, a finite number > 0 and <= `MAX_CP` (100,000,000), and a whole number. `null`/empty clears it.
- **API**: add `cp` to inserts, the PATCH update, and every `SELECT ... FROM character`; return `cp` (or null) in `GET /api/t/:token`.
- **Ranking**: comparator `(b.cp ?? -1) - (a.cp ?? -1) || b.ilvl - a.ilvl`, using a stable sort for roster-order ties.
- **UI**: CP input after item level (placeholder "CP", not required) on the landing row, add form, and edit form; card keeps `Class · ilvl` and adds a second line `CP · <value>` below it only when CP is present.

## Risks / Trade-offs

- Mixed rosters: characters without CP always rank below those with CP, even with higher ilvl. This is the agreed behavior.
- The max CP bound is an assumption; one constant to adjust.
- Migration must be applied to prod D1 before deploying the new code.

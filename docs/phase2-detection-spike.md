# Phase 2 spike: clear detection source

**Date:** 2026-11-10 (desk research only, nothing was run against the game)

## Conclusion

The game does **not** write a local combat or clear log, so option 1 (read the game's own log files) is not viable. The best candidate is to **read the local SQLite database of LOA Logs**, a DPS meter the user already runs. It is read-only, needs no game access, and has the fields we need.

## Options

| Option | Verdict |
| --- | --- |
| Game's own log files (`EFGame/Logs`, `Saved/Logs`) | No. Only client/diagnostic data, no combat or clear events. |
| Third-party output (LOA Logs DB) | **Preferred.** Needs the user to install LOA Logs. |
| Screen/OCR of the clear screen | Fallback. Fragile (UI language, resolution, patches). |
| Memory reading / injection | Off the table. |

## LOA Logs

- Open source (GPL-3.0): `snoww/loa-logs`. It captures game network packets and stores encounters in its own SQLite database (Windows: `%LOCALAPPDATA%\LOA Logs`). The exact file name is still to confirm on a real install.
- `encounter_preview` (from `src-tauri/src/database/migrator.rs`) has `fight_start`, `current_boss`, `difficulty`, `local_player`, `cleared`, `duration`. That covers character name, difficulty and clear flag.
- Because we only read their DB, our app doesn't touch the game. LOA Logs itself still sniffs traffic.

## Risks

- **ToS:** neither Smilegate nor Amazon Games officially endorses DPS meters. Packet-sniffing meters are a grey area, tolerated so far but with no guarantee. We would depend on the user's own choice to run one; check the publisher's current rules before shipping.
- **Schema drift:** the DB is migrated between releases (the code shows several table changes). Read defensively and pin the tested versions.
- **Mapping gap:** the DB stores a **boss name per encounter** (one per gate), not a raid key. We need a table boss name + difficulty -> `raidKey` (e.g. final-gate boss -> `serca-nightmare`), and a rule for which gate marks the raid as cleared. Boss names are probably localised, so confirm on EU.
- **Character mapping:** `local_player` is the character name, which maps to `characterId` via `GET /api/t/:token`.
- **Windows only** in practice, since LOA Logs targets Windows.

## To verify before building

1. Install LOA Logs, clear one raid, then open the DB read-only. Confirm the file path, whether `cleared` is true on the final gate, and the exact `current_boss` and `difficulty` values.
2. Check whether `cleared` is set per gate or per raid.
3. Read the Amazon Games / Smilegate rules on third-party tools.
4. Decide whether to document LOA Logs as a prerequisite or build an OCR fallback.

## Suggested next step

Do step 1 on a Windows machine with the game, then write the OpenSpec change for the detector around the DB reader.

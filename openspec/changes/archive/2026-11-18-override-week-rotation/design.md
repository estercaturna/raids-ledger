## Context

The rotation name is derived in `src/week.ts` (`rotationName`) from an anchor week and parity, and exposed in `GET /api/t/:token` (`rotation`) and `GET /history` (`rotationName`) only when the token hash matches `WEEK_ROTATION_TOKEN_HASH`. It is stateless today. The owner needs to correct it when someone skips a week.

## Goals / Non-Goals

**Goals:**
- Pick Phirk or Skyfire for the current week or any past week, from the UI.
- Keep the automatic alternation as the default.

**Non-Goals:**
- Shifting the following weeks after an override (decided: an override affects only its own week).
- Arbitrary names or future-week planning.

## Decisions

1. **Store overrides in D1.** New table `rotation_override(tracker_id, week_start, name, PRIMARY KEY (tracker_id, week_start))` in `migrations/0005_rotation_override.sql`. Alternative considered: moving the anchor in config; rejected because it needs a deploy per change and inverts every other week.
2. **Resolve with a helper.** `weekRotation(env, week, overrides)` returns the override when present, else the parity name. Both `GET /api/t/:token` and `GET /history` load the tracker's overrides once and pass them in, so there is a single source of truth.
3. **New endpoint `PUT /api/t/:token/rotation`** with `{ weekStart, name | null }`. It returns 404 unless `rotationEnabled`, 400 if `name` is not one of the two configured names (and not null), if `weekStart` is not a valid week start (`weekStartIso` of it must equal it), or if it is after the current week. `null` deletes the row.
4. **Names come from config.** The two allowed names are `ROTATION_ANCHOR_NAME` and `ROTATION_OTHER_NAME`; the API also returns them as `rotation.options` so the UI needs no hardcoding.
5. **UI.** The "Current week: <name>" pill becomes a `<select>` (Phirk, Skyfire, Automatic) that acts on the week being viewed (current or a past week). Changing it calls the endpoint and refreshes state. The week selector entries show the resolved name. Past weeks are only listed when they have clears, which covers the intended use.
6. **History weeks.** `GET /history` already returns `rotationName` per week; it now uses the override. The response also marks `rotationOverridden` so the UI can show "Automatic" vs a fixed choice.

## Risks / Trade-offs

- A past week with no clears is not in the week selector, so it cannot be corrected from the UI. Acceptable: nothing to correct there, and the API still allows it.
- Spec previously said "no stored state"; that is intentionally relaxed for overrides only.

## 1. Data and API

- [x] 1.1 Add `migrations/0004_character_cp.sql` adding nullable `cp INTEGER` to `character`
- [x] 1.2 Extend `validateCharacter`/`CharacterInput` with optional whole-number `cp` (`MAX_CP`), where empty or null clears it
- [x] 1.3 Store and return `cp` in `insertCharacter`, the PATCH update, all `SELECT ... FROM character` queries, and `GET /api/t/:token`

## 2. UI

- [x] 2.1 Add an optional CP input to the landing roster rows (`public/landing.js`) and send it
- [x] 2.2 Add an optional CP input to the add form (`public/tracker.html`/`tracker.js`) and the edit form
- [x] 2.3 Show a `CP · <value>` line below `Class · ilvl` on current-week cards, omitting it when CP is missing
- [x] 2.4 Rank highlights by CP, then ilvl, then roster order in `highlightTiers`

## 3. Tests and polish

- [x] 3.1 Validation tests: valid, missing, invalid, and cleared CP
- [x] 3.2 API tests: add with and without CP, edit and clear CP
- [x] 3.3 Color the CP line green for support classes and red for others, at the same font size as the class line

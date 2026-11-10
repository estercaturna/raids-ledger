# Lost Ark official API: region coverage

**Date tested:** 2026-11-10

## Conclusion

The official Lost Ark Open API (Smilegate, `developer-lostark.game.onstove.com`) only serves **Korean (KR)** service data. EU/NA (Amazon Games) characters are not found, so the API cannot be used to import rosters for EU players.

Because of this, Phase 1 of raids-ledger uses **manual character entry** (name, class, ilvl). See `openspec/changes/raids-ledger-phase1/`.

## How we tested

1. Created a free Stove account and a client at https://developer-lostark.game.onstove.com/clients (name `raids-ledger`, URL left blank) to get an API key.
2. Exported the key (it is a ~634-character JWT) and called the siblings endpoint with an EU Central character (`Iochi`):

```sh
export LOSTARK_KEY='<your key>'
curl -H "Authorization: bearer $LOSTARK_KEY" -H "accept: application/json" \
  "https://developer-lostark.game.onstove.com/characters/Iochi/siblings"
```

3. Result: `[]` (empty list). Other EU characters also returned `[]`.

## Gotchas

- `{"Message":"Authorization has been denied for this request."}` means the token was missing or wrong. In our case the shell variable was not set yet. Check with `echo ${#LOSTARK_KEY}` (should be non-zero).
- The header must be `Authorization: bearer <key>` (no braces, no angle brackets, no quotes inside).
- An unauthenticated request just redirects (HTTP 302).
- Never commit or paste the API key; keep it in an env var or as a Worker secret.

## Caveat

`[]` is also what the API returns for a misspelled name. We did not test a known KR character, so the "KR only" conclusion rests on EU names consistently returning empty plus the API being run by the Korean service. Test a KR character if you need certainty.

## If automatic import is needed later

Options: a third-party community source (fragile, may violate terms of use) or supporting KR players only with the official API. Add it behind a roster-source interface so manual entry keeps working.

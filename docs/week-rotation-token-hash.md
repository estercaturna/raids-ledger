# Week rotation label: how the token hash gates it

Design note for the planned `week-rotation-label` change. Nothing here is implemented yet.

## Goal

Show a label such as **"Current week: Phirk"** that alternates automatically each game week
(Phirk, Skyfire, Phirk, ...), but only on one specific tracker (the owner's), not for everyone.

## How tracker tokens work today

- A tracker is opened with a secret link: `/t/<token>`.
- The server never stores the token. It stores only its SHA-256 hash (`tracker.token_hash`).
- On every `/api/t/:token/*` request, the server hashes the token from the URL and looks
  that hash up in the database (`hashToken` in `src/token.ts`).

## How the label is gated

The owner's token hash is stored in config (a `vars` entry in `wrangler.jsonc`), for example
`WEEK_ROTATION_TOKEN_HASH`.

```
open /t/<token>
   |
   v
server: hash(<token>) = "9f3a..."
   |
   +-- found in DB?  yes -> valid tracker (works today)
   |
   +-- equals WEEK_ROTATION_TOKEN_HASH ?
          yes -> response includes the rotation label (e.g. "Phirk")
          no  -> no label; every other tracker is unchanged
```

The raw token never appears in code, config, or docs. Only the hash does, and a SHA-256 hash
of a 256-bit random token cannot be reversed into the token.

## How the name alternates

No stored state and no cron job. The name is computed from the game week:

- `ROTATION_ANCHOR_WEEK`: the start (Wednesday reset, UTC) of a week known to belong to the anchor name.
- `ROTATION_ANCHOR_NAME` / `ROTATION_OTHER_NAME`: the two names.
- Weeks elapsed since the anchor (via `weekStart` in `src/week.ts`): even -> anchor name, odd -> other name.

Past weeks in history therefore show the correct name too.

## Generating the hash

Compute the SHA-256 hex digest of the token once, locally, and put only the result in config.
Do not commit or paste the token itself.

```
printf '%s' "<token>" | sha256sum
```

This matches `hashToken`, which hex-encodes the SHA-256 of the UTF-8 token string.

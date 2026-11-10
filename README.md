# raids-ledger

Weekly Lost Ark raid clear tracker. You enter your characters (name, class, item level), see the raids each one is eligible for, and tick clears. Clears reset every Wednesday and past weeks are kept as history. There is no login: each tracker is reached through a secret link.

Stack: TypeScript, Cloudflare Workers (Hono), D1. Characters are entered manually because the official Lost Ark API only covers Korea (see `docs/lost-ark-api-region-findings.md`).

## Local development

```sh
npm install
npm run db:local   # apply D1 migrations to the local database
npm run dev        # http://localhost:8787
npm test           # unit and API tests (Vitest)
npm run typecheck
```

## Configuration

- `RESET_HOUR_UTC` (in `wrangler.jsonc`, default `10`): hour of the Wednesday reset, in UTC.
- The raid ilvl requirements live in `src/raids.ts` (`RAIDS`). Only current raids are included (Armoche, Kazeros, Serca, Horizon Cathedral, Belgardin). Values come from Maxroll and Smilegate/Inven; Horizon Cathedral Gate 2 requirements are unverified. Update the table after game patches.

## Deploy

```sh
npx wrangler d1 create raids-ledger   # copy the database_id into wrangler.jsonc
npm run db:remote                     # apply migrations to the remote database
npm run deploy
```

No secrets are required.

## Secret links

A tracker is addressed by `/t/<token>`. The token is random (256 bits) and only its SHA-256 hash is stored. Anyone with the link can view and edit the tracker, and there is no recovery if it is lost.
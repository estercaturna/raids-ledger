import { Hono } from "hono";
import { CLASS_GROUPS } from "./classes";
import { eligibleRaids, GOLD_RAIDS_PER_CHARACTER, RAIDS, weeklyGold, type RaidPrefs } from "./raids";
import { generateToken, hashToken } from "./token";
import { validateCharacter, validateRoster, type CharacterInput } from "./validation";
import { weekStartIso } from "./week";

type Vars = { trackerId: string };
type App = { Bindings: Cloudflare.Env; Variables: Vars };

interface CharacterRow {
  id: number;
  name: string;
  class: string;
  ilvl: number;
}

const app = new Hono<App>();

const resetHour = (env: Cloudflare.Env) => Number(env.RESET_HOUR_UTC ?? 10);
const currentWeek = (env: Cloudflare.Env) => weekStartIso(new Date(), resetHour(env));

app.use("*", async (c, next) => {
  await next();
  c.header("Cache-Control", "no-store");
  c.header("Referrer-Policy", "no-referrer");
});

function insertCharacter(db: D1Database, trackerId: string, ch: CharacterInput) {
  return db
    .prepare(`INSERT INTO character (tracker_id, name, class, ilvl, position)
       VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(position) + 1, 0) FROM character WHERE tracker_id = ?))`,
    )
    .bind(trackerId, ch.name, ch.class, ch.ilvl, trackerId);
}

const isUniqueViolation = (e: unknown) => String(e).includes("UNIQUE");

app.get("/api/meta", (c) => c.json({ classGroups: CLASS_GROUPS }));

app.post("/api/trackers", async (c) => {
  const body = await c.req.json().catch(() => null);
  const { value, errors } = validateRoster((body as { characters?: unknown } | null)?.characters);
  if (!value) return c.json({ error: "invalid_input", fields: errors }, 400);

  const token = generateToken();
  const id = crypto.randomUUID();
  await c.env.DB.batch([
    c.env.DB.prepare("INSERT INTO tracker (id, token_hash) VALUES (?, ?)").bind(id, await hashToken(token)),
    ...value.map((ch) => insertCharacter(c.env.DB, id, ch)),
  ]);
  return c.json({ token, path: `/t/${token}` }, 201);
});

// Everything under /api/t/:token requires a valid secret token.
app.use("/api/t/:token/*", authenticate);
app.use("/api/t/:token", authenticate);

async function authenticate(c: import("hono").Context<App>, next: () => Promise<void>) {
  const token = c.req.param("token") ?? "";
  const row = await c.env.DB.prepare("SELECT id FROM tracker WHERE token_hash = ?")
    .bind(await hashToken(token))
    .first<{ id: string }>();
  if (!row) return c.json({ error: "not_found" }, 404);
  c.set("trackerId", row.id);
  await next();
}

async function loadCharacters(db: D1Database, trackerId: string) {
  const { results } = await db
    .prepare("SELECT id, name, class, ilvl FROM character WHERE tracker_id = ? ORDER BY position, id")
    .bind(trackerId)
    .all<CharacterRow>();
  return results;
}

async function loadPrefs(db: D1Database, trackerId: string) {
  const { results } = await db
    .prepare(
      `SELECT p.character_id, p.raid, p.difficulty FROM raid_pref p
       JOIN character ch ON ch.id = p.character_id WHERE ch.tracker_id = ?`,
    )
    .bind(trackerId)
    .all<{ character_id: number; raid: string; difficulty: string }>();
  const prefs = new Map<number, RaidPrefs>();
  for (const r of results) prefs.set(r.character_id, { ...prefs.get(r.character_id), [r.raid]: r.difficulty });
  return prefs;
}

async function findCharacter(db: D1Database, trackerId: string, id: number) {
  return db
    .prepare("SELECT id, name, class, ilvl FROM character WHERE id = ? AND tracker_id = ?")
    .bind(id, trackerId)
    .first<CharacterRow>();
}

app.get("/api/t/:token", async (c) => {
  const trackerId = c.get("trackerId");
  const week = currentWeek(c.env);
  const characters = await loadCharacters(c.env.DB, trackerId);
  const { results: clears } = await c.env.DB.prepare(
    `SELECT cl.character_id, cl.raid_key FROM clear cl
     JOIN character ch ON ch.id = cl.character_id
     WHERE ch.tracker_id = ? AND cl.week_start = ?`,
  )
    .bind(trackerId, week)
    .all<{ character_id: number; raid_key: string }>();
  const cleared = new Set(clears.map((r) => `${r.character_id}:${r.raid_key}`));
  const prefs = await loadPrefs(c.env.DB, trackerId);

  return c.json({
    weekStart: week,
    characters: characters.map((ch) => {
      const raids = eligibleRaids(ch.ilvl, RAIDS, prefs.get(ch.id)).map((r) => ({ ...r, cleared: cleared.has(`${ch.id}:${r.key}`) }));
      return { ...ch, raids, weeklyGold: weeklyGold(raids.filter((r) => r.cleared).map((r) => r.key)) };
    }),
  });
});

app.post("/api/t/:token/characters", async (c) => {
  const body = await c.req.json().catch(() => null);
  const { value, errors } = validateCharacter(body);
  if (!value) return c.json({ error: "invalid_input", fields: errors }, 400);
  try {
    await insertCharacter(c.env.DB, c.get("trackerId"), value).run();
  } catch (e) {
    if (isUniqueViolation(e)) return c.json({ error: "invalid_input", fields: { name: "Duplicate character name" } }, 409);
    throw e;
  }
  return c.json({ ok: true }, 201);
});

app.patch("/api/t/:token/characters/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const existing = await findCharacter(c.env.DB, c.get("trackerId"), id);
  if (!existing) return c.json({ error: "not_found" }, 404);
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const { value, errors } = validateCharacter({ ...existing, ...body });
  if (!value) return c.json({ error: "invalid_input", fields: errors }, 400);
  try {
    await c.env.DB.prepare(
      "UPDATE character SET name = ?, class = ?, ilvl = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?",
    )
      .bind(value.name, value.class, value.ilvl, id)
      .run();
  } catch (e) {
    if (isUniqueViolation(e)) return c.json({ error: "invalid_input", fields: { name: "Duplicate character name" } }, 409);
    throw e;
  }
  return c.json({ ok: true });
});

app.delete("/api/t/:token/characters/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!(await findCharacter(c.env.DB, c.get("trackerId"), id))) return c.json({ error: "not_found" }, 404);
  await c.env.DB.batch([
    c.env.DB.prepare("DELETE FROM clear WHERE character_id = ?").bind(id),
    c.env.DB.prepare("DELETE FROM character WHERE id = ?").bind(id),
  ]);
  return c.json({ ok: true });
});

app.put("/api/t/:token/clears", async (c) => {
  const body = (await c.req.json().catch(() => null)) as { characterId?: unknown; raidKey?: unknown; cleared?: unknown } | null;
  const characterId = Number(body?.characterId);
  if (typeof body?.raidKey !== "string" || typeof body.cleared !== "boolean" || !Number.isInteger(characterId)) {
    return c.json({ error: "invalid_input" }, 400);
  }
  const ch = await findCharacter(c.env.DB, c.get("trackerId"), characterId);
  if (!ch) return c.json({ error: "not_found" }, 404);
  const chPrefs = (await loadPrefs(c.env.DB, c.get("trackerId"))).get(ch.id);
  const eligible = eligibleRaids(ch.ilvl, RAIDS, chPrefs);
  if (!eligible.some((r) => r.key === body.raidKey)) return c.json({ error: "not_eligible" }, 400);

  const week = currentWeek(c.env);
  if (body.cleared) {
    // Only the visible (currently eligible) clears count towards the limit.
    const { results: rows } = await c.env.DB.prepare("SELECT raid_key FROM clear WHERE character_id = ? AND week_start = ?")
      .bind(characterId, week)
      .all<{ raid_key: string }>();
    const keys = new Set(eligible.map((r) => r.key));
    const others = rows.filter((r) => keys.has(r.raid_key) && r.raid_key !== body.raidKey).length;
    if (others >= GOLD_RAIDS_PER_CHARACTER) return c.json({ error: "limit_reached", limit: GOLD_RAIDS_PER_CHARACTER }, 409);
    await c.env.DB.prepare("INSERT OR IGNORE INTO clear (character_id, week_start, raid_key) VALUES (?, ?, ?)")
      .bind(characterId, week, body.raidKey)
      .run();
  } else {
    await c.env.DB.prepare("DELETE FROM clear WHERE character_id = ? AND week_start = ? AND raid_key = ?")
      .bind(characterId, week, body.raidKey)
      .run();
  }
  return c.json({ ok: true });
});

app.put("/api/t/:token/order", async (c) => {
  const body = (await c.req.json().catch(() => null)) as { ids?: unknown } | null;
  const ids = Array.isArray(body?.ids) ? body.ids.map(Number) : [];
  const existing = (await loadCharacters(c.env.DB, c.get("trackerId"))).map((ch) => ch.id);
  const valid = ids.length === existing.length && new Set(ids).size === ids.length && ids.every((id) => existing.includes(id));
  if (!valid) return c.json({ error: "invalid_input" }, 400);
  await c.env.DB.batch(
    ids.map((id, i) => c.env.DB.prepare("UPDATE character SET position = ? WHERE id = ? AND tracker_id = ?").bind(i, id, c.get("trackerId"))),
  );
  return c.json({ ok: true });
});

app.put("/api/t/:token/prefs", async (c) => {
  const body = (await c.req.json().catch(() => null)) as { characterId?: unknown; raid?: unknown; difficulty?: unknown } | null;
  const characterId = Number(body?.characterId);
  if (typeof body?.raid !== "string" || typeof body.difficulty !== "string" || !Number.isInteger(characterId)) {
    return c.json({ error: "invalid_input" }, 400);
  }
  const ch = await findCharacter(c.env.DB, c.get("trackerId"), characterId);
  if (!ch) return c.json({ error: "not_found" }, 404);
  const raid = eligibleRaids(ch.ilvl).find((r) => r.raid === body.raid);
  if (!raid || !raid.options.some((o) => o.difficulty === body.difficulty)) return c.json({ error: "not_eligible" }, 400);
  await c.env.DB.prepare("INSERT OR REPLACE INTO raid_pref (character_id, raid, difficulty) VALUES (?, ?, ?)")
    .bind(characterId, body.raid, body.difficulty)
    .run();
  return c.json({ ok: true });
});

app.post("/api/t/:token/mark-all", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { characterId?: unknown };
  let characters = await loadCharacters(c.env.DB, c.get("trackerId"));
  if (body.characterId !== undefined) {
    characters = characters.filter((ch) => ch.id === Number(body.characterId));
    if (!characters.length) return c.json({ error: "not_found" }, 404);
  }
  const week = currentWeek(c.env);
  const prefs = await loadPrefs(c.env.DB, c.get("trackerId"));
  const { results: existing } = await c.env.DB.prepare(
    `SELECT cl.character_id, cl.raid_key FROM clear cl JOIN character ch ON ch.id = cl.character_id
     WHERE ch.tracker_id = ? AND cl.week_start = ?`,
  )
    .bind(c.get("trackerId"), week)
    .all<{ character_id: number; raid_key: string }>();
  const done = new Set(existing.map((r) => `${r.character_id}:${r.raid_key}`));
  // Keep current clears and fill the remaining slots with the highest-paying raids.
  const stmts = characters.flatMap((ch) => {
    const eligible = eligibleRaids(ch.ilvl, RAIDS, prefs.get(ch.id));
    const free = GOLD_RAIDS_PER_CHARACTER - eligible.filter((r) => done.has(`${ch.id}:${r.key}`)).length;
    return eligible
      .filter((r) => !done.has(`${ch.id}:${r.key}`))
      .sort((a, b) => (b.gold ?? 0) - (a.gold ?? 0))
      .slice(0, Math.max(0, free))
      .map((r) =>
        c.env.DB.prepare("INSERT OR IGNORE INTO clear (character_id, week_start, raid_key) VALUES (?, ?, ?)").bind(ch.id, week, r.key),
      );
  });
  if (stmts.length) await c.env.DB.batch(stmts);
  return c.json({ ok: true });
});

app.get("/api/t/:token/history", async (c) => {
  const trackerId = c.get("trackerId");
  const { results } = await c.env.DB.prepare(
    `SELECT cl.week_start, ch.id AS character_id, ch.name, cl.raid_key
     FROM clear cl JOIN character ch ON ch.id = cl.character_id
     WHERE ch.tracker_id = ? AND cl.week_start < ?
     ORDER BY cl.week_start DESC, ch.name, cl.raid_key`,
  )
    .bind(trackerId, currentWeek(c.env))
    .all<{ week_start: string; character_id: number; name: string; raid_key: string }>();

  const weeks = new Map<string, Map<number, { id: number; name: string; clears: string[] }>>();
  for (const r of results) {
    const chars = weeks.get(r.week_start) ?? new Map();
    const entry = chars.get(r.character_id) ?? { id: r.character_id, name: r.name, clears: [] };
    entry.clears.push(r.raid_key);
    chars.set(r.character_id, entry);
    weeks.set(r.week_start, chars);
  }
  return c.json({
    weeks: [...weeks].map(([weekStart, chars]) => ({
      weekStart,
      characters: [...chars.values()].map((ch) => ({ ...ch, weeklyGold: weeklyGold(ch.clears) })),
    })),
  });
});

// The tracker page itself; the token is validated by the API calls it makes.
app.get("/t/:token", (c) => c.env.ASSETS.fetch(new Request(new URL("/tracker.html", c.req.url))));

app.notFound((c) => c.json({ error: "not_found" }, 404));

export default app;

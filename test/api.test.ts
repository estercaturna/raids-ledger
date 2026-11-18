import { env, exports } from "cloudflare:workers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { weekStartIso } from "../src/week";
import { hashToken } from "../src/token";

const worker = (exports as unknown as { default: { fetch(r: Request): Promise<Response> } }).default;
const api = (path: string, init?: RequestInit) => worker.fetch(new Request(`http://x${path}`, init));
const json = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { "content-type": "application/json" },
  body: body === undefined ? undefined : JSON.stringify(body),
});

async function createTracker(characters = [{ name: "Iochi", class: "Bard", ilvl: 1725 }]) {
  const res = await api("/api/trackers", json("POST", { characters }));
  expect(res.status).toBe(201);
  return ((await res.json()) as { token: string }).token;
}

beforeEach(async () => {
  await env.DB.batch([env.DB.prepare("DELETE FROM clear"), env.DB.prepare("DELETE FROM character"), env.DB.prepare("DELETE FROM tracker")]);
});

describe("security headers", () => {
  it("sets browser security headers on responses", async () => {
    const res = await api("/api/meta");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("x-frame-options")).toBe("DENY");
    expect(res.headers.get("referrer-policy")).toBe("no-referrer");
    expect(res.headers.get("content-security-policy")).toContain("default-src 'self'");
  });
});

describe("reset countdown", () => {
  it("returns the next reset a week after the current week start", async () => {
    const token = await createTracker();
    const body = (await (await api(`/api/t/${token}`)).json()) as { weekStart: string; nextReset: string };
    expect(Date.parse(body.nextReset) - Date.parse(body.weekStart)).toBe(7 * 24 * 60 * 60 * 1000);
  });
});

describe("tracker creation", () => {
  it("creates a tracker, returns a secret token and stores only its hash", async () => {
    const token = await createTracker();
    expect(token.length).toBeGreaterThanOrEqual(43);
    const { results } = await env.DB.prepare("SELECT token_hash FROM tracker").all<{ token_hash: string }>();
    expect(results).toHaveLength(1);
    expect(results[0].token_hash).not.toContain(token);
  });

  it("rejects invalid input and creates nothing", async () => {
    const res = await api("/api/trackers", json("POST", { characters: [{ name: "", class: "Bard", ilvl: 1600 }] }));
    expect(res.status).toBe(400);
    expect(((await res.json()) as { fields: Record<string, string> }).fields["characters.0.name"]).toBeDefined();
    expect((await env.DB.prepare("SELECT COUNT(*) AS n FROM tracker").first<{ n: number }>())!.n).toBe(0);
  });
});

describe("secret link access", () => {
  it("returns 404 for unknown tokens on every tracker route", async () => {
    for (const [m, p] of [["GET", ""], ["GET", "/history"], ["POST", "/mark-all"], ["PUT", "/clears"], ["POST", "/characters"]]) {
      const res = await api(`/api/t/nope${p}`, json(m, m === "GET" ? undefined : {}));
      expect(res.status, `${m} ${p}`).toBe(404);
    }
  });

  it("exposes no tracker listing and sends no-store/no-referrer headers", async () => {
    await createTracker();
    expect((await api("/api/trackers")).status).toBe(404);
    expect((await api("/api/t")).status).toBe(404);
    const res = await api(`/api/t/${await createTracker()}`);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.get("referrer-policy")).toBe("no-referrer");
  });

  it("isolates trackers from each other", async () => {
    const a = await createTracker([{ name: "A", class: "Bard", ilvl: 1725 }]);
    const b = await createTracker([{ name: "B", class: "Bard", ilvl: 1725 }]);
    const viewA = (await (await api(`/api/t/${a}`)).json()) as { characters: { name: string }[] };
    const viewB = (await (await api(`/api/t/${b}`)).json()) as { characters: { name: string }[] };
    expect(viewA.characters.map((c) => c.name)).toEqual(["A"]);
    expect(viewB.characters.map((c) => c.name)).toEqual(["B"]);
  });
});

type View = { weekStart: string; characters: { id: number; name: string; ilvl: number; raids: { key: string; cleared: boolean }[] }[] };
const view = async (token: string) => (await (await api(`/api/t/${token}`)).json()) as View;

async function storedClears(characterId: number, week: string) {
  const { results } = await env.DB.prepare("SELECT raid_key FROM clear WHERE character_id = ? AND week_start = ? ORDER BY raid_key").bind(characterId, week).all<{ raid_key: string }>();
  return results;
}
const rawClears = (rows: { raid_key: string }[]) => rows.map((r) => r.raid_key);

describe("clears", () => {
  it("toggles a clear idempotently", async () => {
    const token = await createTracker();
    const { characters } = await view(token);
    const ch = characters[0];
    const key = ch.raids[0].key;
    for (let i = 0; i < 2; i++) {
      expect((await api(`/api/t/${token}/clears`, json("PUT", { characterId: ch.id, raidKey: key, cleared: true }))).status).toBe(200);
    }
    expect((await view(token)).characters[0].raids.find((r) => r.key === key)!.cleared).toBe(true);
    for (let i = 0; i < 2; i++) {
      await api(`/api/t/${token}/clears`, json("PUT", { characterId: ch.id, raidKey: key, cleared: false }));
    }
    expect((await view(token)).characters[0].raids.find((r) => r.key === key)!.cleared).toBe(false);
  });

  it("rejects clearing a raid the character is not eligible for", async () => {
    const token = await createTracker([{ name: "Low", class: "Bard", ilvl: 1650 }]);
    const ch = (await view(token)).characters[0];
    const res = await api(`/api/t/${token}/clears`, json("PUT", { characterId: ch.id, raidKey: "belgardin-hard", cleared: true }));
    expect(res.status).toBe(400);
  });

  it("marks all for one character or the whole tracker, repeatedly", async () => {
    const token = await createTracker([
      { name: "A", class: "Bard", ilvl: 1760 },
      { name: "B", class: "Paladin", ilvl: 1705 },
    ]);
    const [a, b] = (await view(token)).characters;
    await api(`/api/t/${token}/mark-all`, json("POST", { characterId: a.id }));
    let v = await view(token);
    // Mark all fills at most 3 raids per character, highest gold first.
    const aRaids = v.characters.find((c) => c.id === a.id)!.raids;
    expect(aRaids.filter((r) => r.cleared).length).toBe(3);
    expect(aRaids.filter((r) => r.cleared).map((r) => r.key).sort()).toEqual(["belgardin-normal", "horizon-cathedral-stage-3", "serca-nightmare"].sort());
    expect(v.characters.find((c) => c.id === b.id)!.raids.some((r) => r.cleared)).toBe(false);
    await api(`/api/t/${token}/mark-all`, json("POST", {}));
    await api(`/api/t/${token}/mark-all`, json("POST", {}));
    v = await view(token);
    expect(v.characters.every((c) => c.raids.filter((r) => r.cleared).length === Math.min(3, c.raids.length))).toBe(true);
  });
});

describe("character order", () => {
  it("persists a custom order, keeps new characters last and validates ids", async () => {
    const token = await createTracker([
      { name: "A", class: "Bard", ilvl: 1750 },
      { name: "B", class: "Paladin", ilvl: 1740 },
      { name: "C", class: "Slayer", ilvl: 1730 },
    ]);
    let chars = (await view(token)).characters;
    expect(chars.map((c) => c.name)).toEqual(["A", "B", "C"]);
    const [a, b, c] = chars.map((x) => x.id);
    const put = (ids: number[]) => api(`/api/t/${token}/order`, json("PUT", { ids }));
    expect((await put([c, a, b])).status).toBe(200);
    await api(`/api/t/${token}/characters`, json("POST", { name: "D", class: "Bard", ilvl: 1800 }));
    chars = (await view(token)).characters;
    expect(chars.map((x) => x.name)).toEqual(["C", "A", "B", "D"]);
    expect((await put([a, b])).status).toBe(400);
    expect((await put([a, a, b, c])).status).toBe(400);
  });
});

describe("clear limit", () => {
  it("rejects a 4th clear for a character but allows unchecking and re-checking", async () => {
    const token = await createTracker([{ name: "A", class: "Bard", ilvl: 1760 }]);
    const ch = (await view(token)).characters[0];
    const put = (key: string, cleared = true) => api(`/api/t/${token}/clears`, json("PUT", { characterId: ch.id, raidKey: key, cleared }));
    const keys = ch.raids.map((r) => r.key);
    for (const k of keys.slice(0, 3)) expect((await put(k)).status).toBe(200);
    expect((await put(keys[0])).status).toBe(200); // already cleared: idempotent
    expect((await put(keys[3])).status).toBe(409);
    expect((await put(keys[0], false)).status).toBe(200);
    expect((await put(keys[3])).status).toBe(200);
  });
});

describe("difficulty preference", () => {
  it("lets a character pick a lower eligible difficulty and rejects others", async () => {
    const token = await createTracker([{ name: "A", class: "Bard", ilvl: 1745 }]);
    const ch = (await view(token)).characters[0];
    expect(ch.raids.find((r) => r.key === "serca-nightmare")).toBeDefined();
    const put = (difficulty: string) => api(`/api/t/${token}/prefs`, json("PUT", { characterId: ch.id, raid: "serca", difficulty }));
    expect((await put("hard")).status).toBe(200);
    const raids = (await view(token)).characters[0].raids;
    expect(raids.find((r) => r.key === "serca-hard")).toBeDefined();
    expect(raids.find((r) => r.key === "serca-nightmare")).toBeUndefined();
    expect((await put("nightmare")).status).toBe(200);
    expect((await put("bogus")).status).toBe(400);
  });
});

describe("difficulty change drops the old clear", () => {
  it("removes this week's clear of the other difficulty only", async () => {
    const token = await createTracker([{ name: "A", class: "Bard", ilvl: 1745 }]);
    const ch = (await view(token)).characters[0];
    const clear = (key: string) => api(`/api/t/${token}/clears`, json("PUT", { characterId: ch.id, raidKey: key, cleared: true }));
    const pref = (difficulty: string) => api(`/api/t/${token}/prefs`, json("PUT", { characterId: ch.id, raid: "serca", difficulty }));
    const current = weekStartIso(new Date(), Number(env.RESET_HOUR_UTC));
    const previous = new Date(new Date(current).getTime() - 7 * 86400_000).toISOString();
    await env.DB.prepare("INSERT INTO clear (character_id, week_start, raid_key) VALUES (?, ?, ?)").bind(ch.id, previous, "serca-nightmare").run();
    await clear("serca-nightmare");
    await clear("kazeros-hard");

    expect((await pref("nightmare")).status).toBe(200); // same difficulty keeps the clear
    expect(rawClears(await storedClears(ch.id, current))).toEqual(["kazeros-hard", "serca-nightmare"]);

    expect((await pref("hard")).status).toBe(200);
    expect(rawClears(await storedClears(ch.id, current))).toEqual(["kazeros-hard"]);
    expect(rawClears(await storedClears(ch.id, previous))).toEqual(["serca-nightmare"]);
  });
});

describe("gold earner limit", () => {
  type GoldView = { characters: { id: number; name: string; goldEarner: boolean; weeklyGold: number; weeklyBound: number; raids: { cleared: boolean }[] }[] };
  const goldView = async (token: string) => (await (await api(`/api/t/${token}`)).json()) as GoldView;
  const roster = ["A", "B", "C", "D", "E", "F", "G"].map((name, i) => ({ name, class: "Bard", ilvl: 1760 - i * 10 }));

  it("zeroes the gold of the 7th character but keeps its clears", async () => {
    const token = await createTracker(roster);
    await api(`/api/t/${token}/mark-all`, json("POST", {}));
    const { characters } = await goldView(token);
    const g = characters.find((c) => c.name === "G")!;
    expect(g.goldEarner).toBe(false);
    expect(g.weeklyGold).toBe(0);
    expect(g.weeklyBound).toBe(0);
    expect(g.raids.some((r) => r.cleared)).toBe(true);
    expect(characters.filter((c) => c.goldEarner)).toHaveLength(6);
    expect(characters.filter((c) => c.goldEarner).every((c) => c.weeklyGold > 0)).toBe(true);
  });

  it("swaps earners when a character's ilvl rises, and applies to history", async () => {
    const token = await createTracker(roster);
    const g = (await goldView(token)).characters.find((c) => c.name === "G")!;
    const current = weekStartIso(new Date(), Number(env.RESET_HOUR_UTC));
    const previous = new Date(new Date(current).getTime() - 7 * 86400_000).toISOString();
    await env.DB.prepare("INSERT INTO clear (character_id, week_start, raid_key) VALUES (?, ?, ?)").bind(g.id, previous, "armoche-normal").run();
    const past = async () => ((await (await api(`/api/t/${token}/history`)).json()) as { weeks: { characters: { id: number; goldEarner: boolean; weeklyGold: number }[] }[] }).weeks[0].characters[0];

    expect(await past()).toMatchObject({ id: g.id, goldEarner: false, weeklyGold: 0 });
    await api(`/api/t/${token}/characters/${g.id}`, json("PATCH", { ilvl: 1800 }));
    expect(await past()).toMatchObject({ id: g.id, goldEarner: true, weeklyGold: 27000 });
    const after = await goldView(token);
    expect(after.characters.find((c) => c.name === "G")!.goldEarner).toBe(true);
    expect(after.characters.find((c) => c.name === "F")!.goldEarner).toBe(false);
  });
});

describe("belgardin matching preference", () => {
  it("accepts matching at ilvl 1750 and rejects it below", async () => {
    const token = await createTracker([
      { name: "A", class: "Bard", ilvl: 1750 },
      { name: "B", class: "Paladin", ilvl: 1740 },
    ]);
    const [a, b] = (await view(token)).characters;
    const put = (id: number) => api(`/api/t/${token}/prefs`, json("PUT", { characterId: id, raid: "belgardin", difficulty: "matching" }));
    expect((await put(a.id)).status).toBe(200);
    expect((await view(token)).characters.find((c) => c.id === a.id)!.raids.find((r) => r.key === "belgardin-matching")).toBeDefined();
    expect((await put(b.id)).status).toBe(400);
  });
});

describe("roster editing", () => {
  it("recomputes eligibility on ilvl update and keeps current clears", async () => {
    const token = await createTracker([{ name: "A", class: "Bard", ilvl: 1705 }]);
    const ch = (await view(token)).characters[0];
    await api(`/api/t/${token}/mark-all`, json("POST", {}));
    const before = ch.raids.length;

    expect((await api(`/api/t/${token}/characters/${ch.id}`, json("PATCH", { ilvl: 1712 }))).status).toBe(200);
    const after = (await view(token)).characters[0];
    expect(after.raids.length).toBeGreaterThan(before);
    // Same raid+difficulty stays cleared; a raid upgraded to a higher difficulty starts uncleared.
    expect(after.raids.find((r) => r.key === "armoche-normal")!.cleared).toBe(true);
    expect(after.raids.find((r) => r.key === "kazeros-normal")!.cleared).toBe(false);
    const stored = await env.DB.prepare("SELECT COUNT(*) AS n FROM clear").first<{ n: number }>();
    expect(stored!.n).toBe(before);
  });

  it("adds, rejects duplicate names, and removes characters", async () => {
    const token = await createTracker();
    expect((await api(`/api/t/${token}/characters`, json("POST", { name: "Second", class: "Paladin", ilvl: 1705 }))).status).toBe(201);
    expect((await api(`/api/t/${token}/characters`, json("POST", { name: "second", class: "Paladin", ilvl: 1705 }))).status).toBe(409);
    const v = await view(token);
    const second = v.characters.find((c) => c.name === "Second")!;
    expect((await api(`/api/t/${token}/characters/${second.id}`, json("DELETE"))).status).toBe(200);
    expect((await view(token)).characters.map((c) => c.name)).toEqual(["Iochi"]);
  });
});

describe("history", () => {
  it("keeps past weeks while the current week starts empty", async () => {
    const token = await createTracker();
    const ch = (await view(token)).characters[0];
    const key = ch.raids[0].key;
    const current = weekStartIso(new Date(), Number(env.RESET_HOUR_UTC));
    const previous = new Date(new Date(current).getTime() - 7 * 86400_000).toISOString();
    await env.DB.prepare("INSERT INTO clear (character_id, week_start, raid_key) VALUES (?, ?, ?)").bind(ch.id, previous, key).run();

    expect((await view(token)).characters[0].raids.every((r) => !r.cleared)).toBe(true);
    const history = (await (await api(`/api/t/${token}/history`)).json()) as {
      weeks: { weekStart: string; characters: { name: string; clears: string[] }[] }[];
    };
    expect(history.weeks).toEqual([{ weekStart: previous, characters: [{ id: ch.id, name: "Iochi", clears: [key], goldEarner: true, weeklyGold: expect.any(Number), weeklyBound: expect.any(Number) }] }]);
  });
});

describe("week rotation label", () => {
  const hashOf = async (token: string) => {
    const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
    return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
  };
  const rotation = async (token: string) => ((await (await api(`/api/t/${token}`)).json()) as { rotation?: { name: string } }).rotation;

  it("shows the rotation only to the configured token", async () => {
    const owner = await createTracker();
    const other = await createTracker([{ name: "Other", class: "Bard", ilvl: 1700 }]);
    const saved = env.WEEK_ROTATION_TOKEN_HASH;
    env.WEEK_ROTATION_TOKEN_HASH = await hashOf(owner);
    try {
      expect((await rotation(owner))?.name).toMatch(/^(Phirk|Skyfire)$/);
      expect(await rotation(other)).toBeUndefined();
    } finally {
      env.WEEK_ROTATION_TOKEN_HASH = saved;
    }
  });

  it("shows nothing when rotation is not configured", async () => {
    const owner = await createTracker();
    const saved = { ...env };
    env.WEEK_ROTATION_TOKEN_HASH = await hashOf(owner);
    env.ROTATION_ANCHOR_NAME = "";
    try {
      expect(await rotation(owner)).toBeUndefined();
    } finally {
      env.WEEK_ROTATION_TOKEN_HASH = saved.WEEK_ROTATION_TOKEN_HASH;
      env.ROTATION_ANCHOR_NAME = saved.ROTATION_ANCHOR_NAME;
    }
  });
});

describe("week rotation override", () => {
  const WEEK = 7 * 24 * 60 * 60 * 1000;
  const current = () => weekStartIso(new Date(), Number(env.RESET_HOUR_UTC));
  const weekAt = (offset: number) => new Date(Date.parse(current()) + offset * WEEK).toISOString();
  type Rot = { name: string; overridden: boolean; options: string[] };
  const rotation = async (token: string) => ((await (await api(`/api/t/${token}`)).json()) as { rotation?: Rot }).rotation;
  const setOverride = (token: string, weekStart: string, name: string | null) => api(`/api/t/${token}/rotation`, json("PUT", { weekStart, name }));

  async function asOwner(run: (owner: string) => Promise<void>) {
    const owner = await createTracker();
    const saved = env.WEEK_ROTATION_TOKEN_HASH;
    env.WEEK_ROTATION_TOKEN_HASH = await hashToken(owner);
    try {
      await run(owner);
    } finally {
      env.WEEK_ROTATION_TOKEN_HASH = saved;
    }
  }

  it("overrides only the chosen week and can be cleared", async () => {
    await asOwner(async (owner) => {
      const auto = (await rotation(owner))!;
      const other = auto.options.find((n) => n !== auto.name)!;
      expect((await setOverride(owner, current(), other)).status).toBe(200);
      expect(await rotation(owner)).toMatchObject({ name: other, overridden: true });
      expect((await setOverride(owner, current(), null)).status).toBe(200);
      expect(await rotation(owner)).toMatchObject({ name: auto.name, overridden: false });
    });
  });

  it("applies to past weeks in history", async () => {
    await asOwner(async (owner) => {
      const previous = weekAt(-1);
      const ch = ((await (await api(`/api/t/${owner}`)).json()) as { characters: { id: number }[] }).characters[0];
      await env.DB.prepare("INSERT INTO clear (character_id, week_start, raid_key) VALUES (?, ?, 'armoche-normal')").bind(ch.id, previous).run();
      const names = async () => ((await (await api(`/api/t/${owner}/history`)).json()) as { weeks: { rotationName: string; rotationOverridden: boolean }[] }).weeks[0];
      const auto = await names();
      const options = (await rotation(owner))!.options;
      const pick = options.find((n) => n !== auto.rotationName)!;
      expect((await setOverride(owner, previous, pick)).status).toBe(200);
      expect(await names()).toMatchObject({ rotationName: pick, rotationOverridden: true });
    });
  });

  it("rejects unknown names, future weeks and invalid weeks", async () => {
    await asOwner(async (owner) => {
      expect((await setOverride(owner, current(), "Nobody")).status).toBe(400);
      expect((await setOverride(owner, weekAt(1), "Phirk")).status).toBe(400);
      expect((await setOverride(owner, "2026-11-19T10:00:00.000Z", "Phirk")).status).toBe(400);
      expect((await rotation(owner))!.overridden).toBe(false);
    });
  });

  it("is refused for other tokens", async () => {
    await asOwner(async () => {
      const other = await createTracker([{ name: "Other", class: "Bard", ilvl: 1700 }]);
      expect((await setOverride(other, current(), "Phirk")).status).toBe(404);
      expect(await rotation(other)).toBeUndefined();
    });
  });
});

describe("combat power", () => {
  const chars = async (token: string) => ((await (await api(`/api/t/${token}`)).json()) as { characters: { id: number; cp: number | null }[] }).characters;

  it("stores CP when given, allows none, and lets edits set and clear it", async () => {
    const token = await createTracker([
      { name: "A", class: "Bard", ilvl: 1700, cp: 6772 } as never,
      { name: "B", class: "Bard", ilvl: 1690 },
    ]);
    const [a, b] = await chars(token);
    expect([a.cp, b.cp]).toEqual([6772, null]);

    expect((await api(`/api/t/${token}/characters/${b.id}`, json("PATCH", { cp: 5000 }))).status).toBe(200);
    expect((await chars(token))[1].cp).toBe(5000);
    expect((await api(`/api/t/${token}/characters/${b.id}`, json("PATCH", { cp: null }))).status).toBe(200);
    expect((await chars(token))[1].cp).toBeNull();
    expect((await api(`/api/t/${token}/characters/${b.id}`, json("PATCH", { cp: -3 }))).status).toBe(400);
  });
});

describe("event raids", () => {
  const roster = [
    { name: "Aurelia", class: "Bard", ilvl: 1782 },
    { name: "Brakka", class: "Berserker", ilvl: 1740 },
    ...Array.from({ length: 6 }, (_, i) => ({ name: `Alt${i}`, class: "Bard", ilvl: 1700 - i })),
  ];
  type Ch = { id: number; name: string; weeklyGold: number; raids: { key: string }[]; eventRaids: { key: string; lockedBy: string | null; cleared: boolean }[] };
  const state = async (token: string) => ((await (await api(`/api/t/${token}`)).json()) as { characters: Ch[] }).characters;
  const clear = (token: string, characterId: number, raidKey: string, cleared = true) => api(`/api/t/${token}/clears`, json("PUT", { characterId, raidKey, cleared }));

  afterEach(() => vi.useRealTimers());
  const inWindow = () => vi.useFakeTimers({ toFake: ["Date"], now: new Date("2026-11-19T12:00:00Z") });

  it("pays event gold on top of 3 regular raids and even to non-earners", async () => {
    inWindow();
    const token = await createTracker(roster);
    const [aurelia, brakka, ...alts] = await state(token);
    for (const r of aurelia.raids.slice(0, 3)) expect((await clear(token, aurelia.id, r.key)).status).toBe(200);
    expect((await clear(token, aurelia.id, "mordum-hard")).status).toBe(200);
    const after = await state(token);
    expect(after[0].weeklyGold).toBeGreaterThanOrEqual(50000);
    expect(brakka.eventRaids.map((r) => r.key)).toEqual(["mordum-normal"]);
    expect(alts.at(-1)!.eventRaids).toEqual([]);
  });

  it("blocks a second character and frees the entry when unmarked", async () => {
    inWindow();
    const token = await createTracker(roster);
    const [aurelia, brakka] = await state(token);
    expect((await clear(token, aurelia.id, "mordum-hard")).status).toBe(200);
    const blocked = await clear(token, brakka.id, "mordum-normal");
    expect(blocked.status).toBe(409);
    expect(((await blocked.json()) as { error: string }).error).toBe("roster_limit_reached");
    expect((await state(token))[1].eventRaids[0].lockedBy).toBe("Aurelia");
    await clear(token, aurelia.id, "mordum-hard", false);
    expect((await clear(token, brakka.id, "mordum-normal")).status).toBe(200);
  });

  it("rejects event clears outside the window and ignores them in mark-all", async () => {
    vi.useFakeTimers({ toFake: ["Date"], now: new Date("2026-12-17T12:00:00Z") });
    const token = await createTracker(roster);
    const [aurelia] = await state(token);
    expect(aurelia.eventRaids).toEqual([]);
    expect((await clear(token, aurelia.id, "mordum-hard")).status).toBe(400);
    vi.setSystemTime(new Date("2026-11-19T12:00:00Z"));
    await api(`/api/t/${token}/mark-all`, json("POST", {}));
    expect((await state(token))[0].eventRaids.every((r) => !r.cleared)).toBe(true);
  });

  it("keeps event gold in history after the window ends", async () => {
    inWindow();
    const token = await createTracker(roster);
    const [aurelia] = await state(token);
    await clear(token, aurelia.id, "mordum-hard");
    vi.setSystemTime(new Date("2026-12-17T12:00:00Z"));
    const history = (await (await api(`/api/t/${token}/history`)).json()) as { weeks: { characters: { weeklyGold: number }[] }[] };
    expect(history.weeks[0].characters[0].weeklyGold).toBe(50000);
  });
});

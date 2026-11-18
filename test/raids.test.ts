import { describe, expect, it } from "vitest";
import { eligibleEventRaids, eligibleRaids, goldEarnerIds, RAIDS, weeklyBoundGold, weeklyEventGold, weeklyGold, type RaidEntry } from "../src/raids";

const table: RaidEntry[] = [
  { raid: "a", name: "A", difficulty: "normal", minIlvl: 1400 },
  { raid: "a", name: "A", difficulty: "hard", minIlvl: 1500 },
  { raid: "b", name: "B", difficulty: "normal", minIlvl: 1450 },
];

describe("eligibleRaids", () => {
  it("includes a raid when ilvl equals the minimum", () => {
    expect(eligibleRaids(1400, table).map((e) => e.key)).toEqual(["a-normal"]);
  });

  it("excludes raids above the ilvl", () => {
    expect(eligibleRaids(1399, table)).toEqual([]);
  });

  it("offers only the highest difficulty per raid", () => {
    expect(eligibleRaids(1500, table).map((e) => e.key)).toEqual(["a-hard", "b-normal"]);
  });
});

describe("weeklyGold", () => {
  const gold: RaidEntry[] = [
    { raid: "a", name: "A", difficulty: "normal", minIlvl: 1, gold: 10 },
    { raid: "b", name: "B", difficulty: "normal", minIlvl: 1, gold: 40 },
    { raid: "c", name: "C", difficulty: "normal", minIlvl: 1, gold: 30 },
    { raid: "d", name: "D", difficulty: "normal", minIlvl: 1, gold: 20 },
    { raid: "e", name: "E", difficulty: "normal", minIlvl: 1 },
  ];
  it("sums only the three highest-paying clears and ignores raids without gold data", () => {
    expect(weeklyGold(["a-normal", "b-normal", "c-normal", "d-normal", "e-normal"], gold)).toBe(90);
    expect(weeklyGold(["a-normal", "e-normal"], gold)).toBe(10);
    expect(weeklyGold([], gold)).toBe(0);
  });
});

describe("weeklyBoundGold", () => {
  const table: RaidEntry[] = [
    { raid: "a", name: "A", difficulty: "normal", minIlvl: 1, gold: 40, bound: 20 },
    { raid: "b", name: "B", difficulty: "hard", minIlvl: 1, gold: 30 },
    { raid: "c", name: "C", difficulty: "normal", minIlvl: 1, gold: 20, bound: 20 },
    { raid: "d", name: "D", difficulty: "normal", minIlvl: 1, gold: 10, bound: 10 },
  ];

  it("sums bound gold of only the top-paying raids", () => {
    expect(weeklyBoundGold(["a-normal", "b-hard", "c-normal", "d-normal"], table)).toBe(40);
  });
});

describe("Belgardin matching mode", () => {
  it("is offered but never the default", () => {
    const e = eligibleRaids(1750, RAIDS).find((x) => x.raid === "belgardin")!;
    expect(e.key).toBe("belgardin-normal");
    expect(e.options.map((o) => o.difficulty)).toEqual(["matching", "normal"]);
  });

  it("uses a stored matching preference and splits gold 50/50", () => {
    const e = eligibleRaids(1750, RAIDS, { belgardin: "matching" }).find((x) => x.raid === "belgardin")!;
    expect(e.key).toBe("belgardin-matching");
    expect(e.bound).toBe(25000);
    expect(weeklyBoundGold(["belgardin-matching"])).toBe(25000);
    expect(weeklyBoundGold(["belgardin-normal"])).toBe(0);
  });
});

describe("goldEarnerIds", () => {
  const roster = (ilvls: (number | [number, number | null])[]) =>
    ilvls.map((v, i) => (Array.isArray(v) ? { id: i + 1, ilvl: v[0], cp: v[1] } : { id: i + 1, ilvl: v, cp: null }));

  it("includes everyone in a roster of 6 or fewer", () => {
    expect([...goldEarnerIds(roster([1700, 1600, 1500]))].sort()).toEqual([1, 2, 3]);
  });

  it("drops the lowest ilvl from a roster of 7", () => {
    const ids = goldEarnerIds(roster([1700, 1710, 1720, 1730, 1740, 1650, 1750]));
    expect(ids.size).toBe(6);
    expect(ids.has(6)).toBe(false);
  });

  it("breaks ilvl ties by higher cp, with a missing cp last", () => {
    const base = [1750, 1750, 1750, 1750, 1750];
    expect(goldEarnerIds(roster([...base, [1700, null], [1700, 5000]])).has(7)).toBe(true);
    expect(goldEarnerIds(roster([...base, [1700, null], [1700, 5000]])).has(6)).toBe(false);
  });

  it("falls back to roster order when ilvl and cp tie", () => {
    const ids = goldEarnerIds(roster([1700, 1700, 1700, 1700, 1700, 1700, 1700]));
    expect(ids.has(6)).toBe(true);
    expect(ids.has(7)).toBe(false);
  });
});

describe("event raids", () => {
  it("are never part of eligibleRaids", () => {
    expect(eligibleRaids(1782).some((e) => e.raid === "mordum")).toBe(false);
  });

  it("are offered only inside the window and above the ilvl", () => {
    const keys = (ilvl: number, week: string) => eligibleEventRaids(ilvl, week).map((e) => e.key);
    expect(keys(1782, "2026-11-18T10:00:00.000Z")).toEqual(["mordum-hard"]);
    expect(keys(1750, "2026-12-09T10:00:00.000Z")).toEqual(["mordum-normal"]);
    expect(keys(1782, "2026-11-11T10:00:00.000Z")).toEqual([]);
    expect(keys(1782, "2026-12-16T10:00:00.000Z")).toEqual([]);
    expect(keys(1729, "2026-11-18T10:00:00.000Z")).toEqual([]);
  });

  it("exposes the end date and both difficulties", () => {
    const [e] = eligibleEventRaids(1782, "2026-11-18T10:00:00.000Z");
    expect(e.eventUntil).toBe("2026-12-16");
    expect(e.options.map((o) => o.difficulty)).toEqual(["normal", "hard"]);
  });

  it("add gold on top without displacing the top 3 raids", () => {
    const keys = ["armoche-hard", "kazeros-hard", "serca-hard", "mordum-hard"];
    expect(weeklyGold(keys)).toBe(weeklyGold(keys.slice(0, 3)));
    expect(weeklyEventGold(keys)).toBe(50000);
    expect(weeklyEventGold(["mordum-normal"])).toBe(20000);
  });
});

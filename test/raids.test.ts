import { describe, expect, it } from "vitest";
import { eligibleRaids, weeklyBoundGold, weeklyGold, type RaidEntry } from "../src/raids";

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

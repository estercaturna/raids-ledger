export type Difficulty = "normal" | "hard" | "nightmare" | "stage-1" | "stage-2" | "stage-3";

export interface RaidEntry {
  raid: string;
  name: string;
  difficulty: Difficulty;
  minIlvl: number;
  /** Total gold (tradable + bound) for clearing; undefined when not yet published. */
  gold?: number;
  /** Part of `gold` that is character-bound (the rest is tradable roster gold). Defaults to 0. */
  bound?: number;
}

export interface Eligibility {
  key: string;
  raid: string;
  name: string;
  difficulty: Difficulty;
  label: string;
  minIlvl: number;
  gold: number | null;
  bound: number;
}

// Current endgame content only (Tier 4). Values from Maxroll (Armoche, Kazeros, Serca,
// Horizon Cathedral) and Smilegate/Inven (Belgardin). Verify after game patches and update here.
export const RAIDS: RaidEntry[] = [
  { raid: "armoche", name: "Armoche", difficulty: "normal", minIlvl: 1700, gold: 27000, bound: 13500 },
  { raid: "armoche", name: "Armoche", difficulty: "hard", minIlvl: 1720, gold: 38000 },
  { raid: "kazeros", name: "Kazeros", difficulty: "normal", minIlvl: 1710, gold: 32000, bound: 16000 },
  { raid: "kazeros", name: "Kazeros", difficulty: "hard", minIlvl: 1730, gold: 48000 },
  { raid: "serca", name: "Serca", difficulty: "normal", minIlvl: 1710, gold: 32000, bound: 16000 },
  { raid: "serca", name: "Serca", difficulty: "hard", minIlvl: 1730, gold: 44000 },
  { raid: "serca", name: "Serca", difficulty: "nightmare", minIlvl: 1740, gold: 54000 },
  { raid: "horizon-cathedral", name: "Horizon Cathedral", difficulty: "stage-1", minIlvl: 1700, gold: 30000, bound: 30000 },
  { raid: "horizon-cathedral", name: "Horizon Cathedral", difficulty: "stage-2", minIlvl: 1720, gold: 40000, bound: 40000 },
  { raid: "horizon-cathedral", name: "Horizon Cathedral", difficulty: "stage-3", minIlvl: 1750, gold: 50000, bound: 50000 },
  { raid: "belgardin", name: "Belgardin", difficulty: "normal", minIlvl: 1750, gold: 50000, bound: 25000 },
  { raid: "belgardin", name: "Belgardin", difficulty: "hard", minIlvl: 1770, gold: 62000 },
  { raid: "belgardin", name: "Belgardin", difficulty: "nightmare", minIlvl: 1780, gold: 75000 },
];

const RANK: Record<Difficulty, number> = { normal: 0, hard: 1, nightmare: 2, "stage-1": 0, "stage-2": 1, "stage-3": 2 };

const LABELS: Record<Difficulty, string> = {
  normal: "Normal",
  hard: "Hard",
  nightmare: "Nightmare",
  "stage-1": "Stage 1",
  "stage-2": "Stage 2",
  "stage-3": "Stage 3",
};

export function raidKey(raid: string, difficulty: Difficulty): string {
  return `${raid}-${difficulty}`;
}

export type RaidPrefs = Record<string, string>;

export interface EligibilityWithOptions extends Eligibility {
  options: { difficulty: Difficulty; label: string }[];
}

/**
 * One entry per eligible raid. Uses the preferred difficulty when the character still
 * qualifies for it, otherwise the highest eligible one. `options` lists every eligible difficulty.
 */
export function eligibleRaids(ilvl: number, table: RaidEntry[] = RAIDS, prefs: RaidPrefs = {}): EligibilityWithOptions[] {
  const byRaid = new Map<string, RaidEntry[]>();
  for (const entry of table) {
    if (entry.minIlvl > ilvl) continue;
    byRaid.set(entry.raid, [...(byRaid.get(entry.raid) ?? []), entry]);
  }
  return [...byRaid.values()].map((entries) => {
    entries.sort((a, b) => RANK[a.difficulty] - RANK[b.difficulty]);
    const e = entries.find((x) => x.difficulty === prefs[x.raid]) ?? entries[entries.length - 1];
    return {
      key: raidKey(e.raid, e.difficulty),
      raid: e.raid,
      name: e.name,
      difficulty: e.difficulty,
      label: LABELS[e.difficulty],
      minIlvl: e.minIlvl,
      gold: e.gold ?? null,
      bound: e.bound ?? 0,
      options: entries.map((x) => ({ difficulty: x.difficulty, label: LABELS[x.difficulty] })),
    };
  });
}

/** Gold values come from lostmokokos.com (Sept 2026 patch); Belgardin from Maxroll (Oct 2026). */
export const GOLD_RAIDS_PER_CHARACTER = 3;

export function goldForKey(key: string, table: RaidEntry[] = RAIDS): number {
  return table.find((e) => raidKey(e.raid, e.difficulty) === key)?.gold ?? 0;
}

/** In-game rule: only a character's highest-paying cleared raids award gold. */
export function weeklyGold(keys: string[], table: RaidEntry[] = RAIDS): number {
  return keys
    .map((k) => goldForKey(k, table))
    .sort((a, b) => b - a)
    .slice(0, GOLD_RAIDS_PER_CHARACTER)
    .reduce((sum, g) => sum + g, 0);
}

/** Character-bound part of the gold a character earns: same top-paying raids as `weeklyGold`. */
export function weeklyBoundGold(keys: string[], table: RaidEntry[] = RAIDS): number {
  return keys
    .map((k) => table.find((e) => raidKey(e.raid, e.difficulty) === k))
    .filter((e): e is RaidEntry => !!e)
    .sort((a, b) => (b.gold ?? 0) - (a.gold ?? 0))
    .slice(0, GOLD_RAIDS_PER_CHARACTER)
    .reduce((sum, e) => sum + (e.bound ?? 0), 0);
}

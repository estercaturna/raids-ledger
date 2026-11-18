export type Difficulty = "matching" | "normal" | "hard" | "nightmare" | "stage-1" | "stage-2" | "stage-3";

export interface RaidEntry {
  raid: string;
  name: string;
  difficulty: Difficulty;
  minIlvl: number;
  /** Total gold (tradable + bound) for clearing; undefined when not yet published. */
  gold?: number;
  /** Part of `gold` that is character-bound (the rest is tradable roster gold). Defaults to 0. */
  bound?: number;
  /** Time-limited extra raid, offered only in game weeks from `fromWeek` to `toWeek` (inclusive, YYYY-MM-DD of the reset day). */
  event?: { fromWeek: string; toWeek: string };
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
  /** For event raids: the reset day (YYYY-MM-DD) on which the event ends. */
  eventUntil?: string;
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
  // Only Matching Mode pays 50% character-bound gold. Normal/Hard/Nightmare are treated as 100% roster
  // gold; Hard/Nightmare bound is unverified in-game and assumed to be 0.
  { raid: "belgardin", name: "Belgardin", difficulty: "matching", minIlvl: 1750, gold: 50000, bound: 25000 },
  { raid: "belgardin", name: "Belgardin", difficulty: "normal", minIlvl: 1750, gold: 50000 },
  { raid: "belgardin", name: "Belgardin", difficulty: "hard", minIlvl: 1770, gold: 62000 },
  { raid: "belgardin", name: "Belgardin", difficulty: "nightmare", minIlvl: 1780, gold: 75000 },
  // Event raid (official patch notes, 18 Nov 2026): paid in full to any character, outside the 3-raid limit,
  // 1 entry per roster per week shared by both difficulties. Bound part is not published, so it counts as roster gold.
  { raid: "mordum", name: "Extreme Mordum", difficulty: "normal", minIlvl: 1730, gold: 20000, event: { fromWeek: "2026-11-18", toWeek: "2026-12-09" } },
  { raid: "mordum", name: "Extreme Mordum", difficulty: "hard", minIlvl: 1770, gold: 50000, event: { fromWeek: "2026-11-18", toWeek: "2026-12-09" } },
];

const RANK: Record<Difficulty, number> = { matching: -1, normal: 0, hard: 1, nightmare: 2, "stage-1": 0, "stage-2": 1, "stage-3": 2 };

const LABELS: Record<Difficulty, string> = {
  matching: "Matching",
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
 * Event raids are never included: they have their own limits (see `eligibleEventRaids`).
 */
export function eligibleRaids(ilvl: number, table: RaidEntry[] = RAIDS, prefs: RaidPrefs = {}): EligibilityWithOptions[] {
  return pickPerRaid(table.filter((e) => !e.event && e.minIlvl <= ilvl), prefs);
}

const weekDay = (weekIso: string) => weekIso.slice(0, 10);

/** Event raids a character can clear in the game week starting at `weekIso`, shaped like `eligibleRaids`. */
export function eligibleEventRaids(ilvl: number, weekIso: string, table: RaidEntry[] = RAIDS, prefs: RaidPrefs = {}): EligibilityWithOptions[] {
  const day = weekDay(weekIso);
  return pickPerRaid(
    table.filter((e) => e.event && e.event.fromWeek <= day && day <= e.event.toWeek && e.minIlvl <= ilvl),
    prefs,
  );
}

function eventUntil(toWeek: string): string {
  return new Date(Date.parse(toWeek) + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function pickPerRaid(entries: RaidEntry[], prefs: RaidPrefs): EligibilityWithOptions[] {
  const byRaid = new Map<string, RaidEntry[]>();
  for (const entry of entries) byRaid.set(entry.raid, [...(byRaid.get(entry.raid) ?? []), entry]);
  return [...byRaid.values()].map((group) => {
    group.sort((a, b) => RANK[a.difficulty] - RANK[b.difficulty]);
    const e = group.find((x) => x.difficulty === prefs[x.raid]) ?? group[group.length - 1];
    return {
      key: raidKey(e.raid, e.difficulty),
      raid: e.raid,
      name: e.name,
      difficulty: e.difficulty,
      label: LABELS[e.difficulty],
      minIlvl: e.minIlvl,
      gold: e.gold ?? null,
      bound: e.bound ?? 0,
      ...(e.event && { eventUntil: eventUntil(e.event.toWeek) }),
      options: group.map((x) => ({ difficulty: x.difficulty, label: LABELS[x.difficulty] })),
    };
  });
}

/** Gold values come from lostmokokos.com (Sept 2026 patch); Belgardin from Maxroll (Oct 2026); Extreme Mordum from the 18 Nov 2026 patch notes. */
export const GOLD_RAIDS_PER_CHARACTER = 3;

export function goldForKey(key: string, table: RaidEntry[] = RAIDS): number {
  return table.find((e) => raidKey(e.raid, e.difficulty) === key)?.gold ?? 0;
}

const isEventKey = (key: string, table: RaidEntry[]) => !!table.find((e) => raidKey(e.raid, e.difficulty) === key)?.event;

/** In-game rule: only a character's highest-paying cleared regular raids award gold. Event raids are excluded. */
export function weeklyGold(keys: string[], table: RaidEntry[] = RAIDS): number {
  return keys
    .filter((k) => !isEventKey(k, table))
    .map((k) => goldForKey(k, table))
    .sort((a, b) => b - a)
    .slice(0, GOLD_RAIDS_PER_CHARACTER)
    .reduce((sum, g) => sum + g, 0);
}

/** Character-bound part of the gold a character earns: same top-paying raids as `weeklyGold`. */
export function weeklyBoundGold(keys: string[], table: RaidEntry[] = RAIDS): number {
  return keys
    .filter((k) => !isEventKey(k, table))
    .map((k) => table.find((e) => raidKey(e.raid, e.difficulty) === k))
    .filter((e): e is RaidEntry => !!e)
    .sort((a, b) => (b.gold ?? 0) - (a.gold ?? 0))
    .slice(0, GOLD_RAIDS_PER_CHARACTER)
    .reduce((sum, e) => sum + (e.bound ?? 0), 0);
}

/** Gold of cleared event raids: added on top of the weekly gold and paid even to characters that are not gold earners. */
export function weeklyEventGold(keys: string[], table: RaidEntry[] = RAIDS): number {
  return keys.filter((k) => isEventKey(k, table)).reduce((sum, k) => sum + goldForKey(k, table), 0);
}

/** Character-bound part of `weeklyEventGold`. */
export function weeklyEventBound(keys: string[], table: RaidEntry[] = RAIDS): number {
  return keys
    .map((k) => table.find((e) => raidKey(e.raid, e.difficulty) === k))
    .filter((e): e is RaidEntry => !!e?.event)
    .reduce((sum, e) => sum + (e.bound ?? 0), 0);
}

/** In-game rule: only a roster's 6 strongest characters earn gold each week. */
export const GOLD_EARNERS_PER_ROSTER = 6;

/**
 * Ids of the characters that earn gold: highest ilvl first, ties by higher combat power
 * (missing cp ranks last), then roster order. `characters` must already be in roster order.
 */
export function goldEarnerIds(characters: { id: number; ilvl: number; cp: number | null }[]): Set<number> {
  return new Set(
    characters
      .map((ch, position) => ({ ...ch, position }))
      .sort((a, b) => b.ilvl - a.ilvl || (b.cp ?? -1) - (a.cp ?? -1) || a.position - b.position)
      .slice(0, GOLD_EARNERS_PER_ROSTER)
      .map((ch) => ch.id),
  );
}

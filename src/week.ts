const DAY_MS = 24 * 60 * 60 * 1000;
const WEDNESDAY = 3;

/** Start of the game week containing `now`: the latest Wednesday reset instant (UTC) not after `now`. */
export function weekStart(now: Date, resetHourUtc = 10): Date {
  const todayReset = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    resetHourUtc,
  );
  const daysSinceWednesday = (now.getUTCDay() - WEDNESDAY + 7) % 7;
  let start = todayReset - daysSinceWednesday * DAY_MS;
  if (start > now.getTime()) start -= 7 * DAY_MS;
  return new Date(start);
}

export function weekStartIso(now: Date, resetHourUtc = 10): string {
  return weekStart(now, resetHourUtc).toISOString();
}

const WEEK_MS = 7 * DAY_MS;

/** Alternates between two names by week parity relative to an anchor week; stateless. */
export function rotationName(weekStartIso: string, anchorWeekIso: string, anchorName: string, otherName: string): string {
  const weeks = Math.round((Date.parse(weekStartIso) - Date.parse(anchorWeekIso)) / WEEK_MS);
  return ((weeks % 2) + 2) % 2 === 0 ? anchorName : otherName;
}

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

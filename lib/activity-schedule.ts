import { activities, type Activity } from "./words";

// Plan three visits per team together: a greedy draw can trap a later team.
export function planActivities(
  previousByTeam: readonly (Activity | undefined)[],
  firstTeam = 0,
  previous?: Activity,
  random = Math.random,
): Activity[] {
  const count = previousByTeam.length;
  if (
    count < 2 ||
    count > 6 ||
    !Number.isInteger(firstTeam) ||
    firstTeam < 0 ||
    firstTeam >= count
  )
    throw new Error("Invalid activity schedule teams");
  const last = [...previousByTeam];
  const used = Array.from({ length: count }, () => new Set<Activity>());
  const schedule: Activity[] = [];
  function search(prior?: Activity): boolean {
    if (schedule.length === count * 3) return true;
    const team = (firstTeam + schedule.length) % count;
    const candidates = [...activities];
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    for (const activity of candidates) {
      if (
        activity === prior ||
        activity === last[team] ||
        used[team].has(activity)
      )
        continue;
      const old = last[team];
      last[team] = activity;
      used[team].add(activity);
      schedule.push(activity);
      if (search(activity)) return true;
      schedule.pop();
      used[team].delete(activity);
      last[team] = old;
    }
    return false;
  }
  if (!search(previous)) throw new Error("No valid activity schedule");
  return schedule;
}

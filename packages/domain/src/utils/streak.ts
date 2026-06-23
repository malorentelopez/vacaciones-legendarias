import type { StreakProgress } from "./avatar";
import { parseLocalDateKey, toLocalDateKey } from "./schedule";

export function getYesterdayDateKey(dateKey: string): string {
  const date = parseLocalDateKey(dateKey);
  date.setDate(date.getDate() - 1);
  return toLocalDateKey(date);
}

export function isMorningSection(section: string | null | undefined): boolean {
  if (!section) return false;
  const normalized = section.toLowerCase();
  return normalized.includes("mañana") || normalized.includes("manana") || normalized === "morning";
}

export interface StreakUpdateResult {
  streak: StreakProgress;
  incremented: boolean;
  reset: boolean;
}

export function advanceStreak(
  streak: StreakProgress | undefined,
  todayKey: string
): StreakUpdateResult {
  if (streak?.lastActiveDate === todayKey) {
    return {
      streak: streak,
      incremented: false,
      reset: false,
    };
  }

  const yesterdayKey = getYesterdayDateKey(todayKey);
  let current = 1;
  let reset = false;

  if (streak?.lastActiveDate === yesterdayKey) {
    current = streak.current + 1;
  } else if (streak?.lastActiveDate) {
    reset = true;
    current = 1;
  }

  return {
    streak: {
      current,
      lastActiveDate: todayKey,
      best: Math.max(current, streak?.best ?? 0),
      milestonesAwarded: streak?.milestonesAwarded ?? [],
    },
    incremented: true,
    reset,
  };
}

export function getPeriodKey(frequency: "DAILY" | "WEEKLY" | "MONTHLY", date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  if (frequency === "DAILY") {
    return `${year}-${month}-${day}`;
  }

  if (frequency === "WEEKLY") {
    const startOfYear = new Date(year, 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${year}-W${String(week).padStart(2, "0")}`;
  }

  return `${year}-${month}`;
}

export function getWeekKey(date = new Date()): string {
  return getPeriodKey("WEEKLY", date);
}

export function calculateXpForNextLevel(
  currentLevel: number,
  currentXp: number,
  levels: { level: number; xpRequired: number }[]
): { xpInLevel: number; xpNeeded: number; progress: number } {
  const current = levels.find((l) => l.level === currentLevel);
  const next = levels.find((l) => l.level === currentLevel + 1);

  if (!current || !next) {
    return { xpInLevel: currentXp, xpNeeded: 0, progress: 100 };
  }

  const xpInLevel = currentXp - current.xpRequired;
  const xpNeeded = next.xpRequired - current.xpRequired;
  const progress = xpNeeded > 0 ? Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)) : 100;

  return { xpInLevel, xpNeeded, progress };
}

import { toLocalDateKey } from "@repo/domain";

export function getDayMoodEmoji(options: {
  isFreeDay?: boolean;
  dayType?: string;
  dateKey?: string;
}): string {
  if (options.isFreeDay) return "🌴";
  if (options.dayType === "FRIDAY") return "🎉";

  const key = options.dateKey ?? toLocalDateKey(new Date());
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash + key.charCodeAt(i) * (i + 1)) % 100;
  }
  if (hash < 10) return "🌧️";

  return "☀️";
}

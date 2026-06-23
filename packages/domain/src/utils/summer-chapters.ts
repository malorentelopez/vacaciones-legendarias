export const DEFAULT_SUMMER_START = { month: 6, day: 22 };

export interface SummerChapter {
  number: number;
  title: string;
}

export interface SummerStartDate {
  month: number;
  day: number;
}

function getSummerStartDate(year: number, start: SummerStartDate): Date {
  return new Date(year, start.month - 1, start.day);
}

export function getSummerWeek(date: Date = new Date(), start: SummerStartDate = DEFAULT_SUMMER_START): number {
  const summerStart = getSummerStartDate(date.getFullYear(), start);
  if (date < summerStart) return 0;

  const diffDays = Math.floor((date.getTime() - summerStart.getTime()) / (24 * 60 * 60 * 1000));
  return Math.floor(diffDays / 7) + 1;
}

export function getSummerChapter(
  date: Date = new Date(),
  start: SummerStartDate = DEFAULT_SUMMER_START
): SummerChapter {
  const week = getSummerWeek(date, start);

  if (week <= 0) {
    return { number: 0, title: "Preludio del verano" };
  }
  if (week === 1) {
    return { number: 1, title: "El despertar del héroe" };
  }
  if (week === 2) {
    return { number: 2, title: "Primeros combates diarios" };
  }
  if (week === 3) {
    return { number: 3, title: "El camino del entrenamiento" };
  }
  if (date.getMonth() === 6) {
    return { number: 4, title: "El mes del dragón" };
  }

  return { number: Math.min(week, 5), title: "La leyenda del verano" };
}

export function formatSummerChapter(chapter: SummerChapter): string {
  if (chapter.number <= 0) return chapter.title;
  return `Capítulo ${chapter.number}: ${chapter.title}`;
}

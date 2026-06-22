import type { DayScheduleType } from "@repo/database";

export function getDayScheduleType(date: Date = new Date()): DayScheduleType {
  const day = date.getDay();
  return day === 0 || day === 6 ? "WEEKEND" : "WEEKDAY";
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function isTimeInBlock(now: Date, startTime: string, endTime: string | null): boolean {
  const current = now.getHours() * 60 + now.getMinutes();
  const start = parseTimeToMinutes(startTime);
  if (!endTime) return current >= start;
  const end = parseTimeToMinutes(endTime);
  return current >= start && current < end;
}

export const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function formatAgendaDate(date: Date = new Date()): string {
  const dayName = DAY_NAMES[date.getDay()];
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  return `${dayName} ${day} de ${month}`;
}

import type { DayScheduleType } from "@repo/database";

export function getDayScheduleType(date: Date = new Date()): DayScheduleType {
  const day = date.getDay();
  if (day === 0 || day === 6) return "WEEKEND";
  if (day === 5) return "FRIDAY";
  return "WEEKDAY";
}

export function getDayScheduleTypeLabel(dayType: DayScheduleType): string {
  switch (dayType) {
    case "WEEKDAY":
      return "Modo aventura";
    case "FRIDAY":
      return "Viernes legendario";
    case "WEEKEND":
      return "Modo explorador";
  }
}

export function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseLocalDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
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

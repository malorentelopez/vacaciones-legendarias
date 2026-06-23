"use client";

import { useState } from "react";
import { Card } from "@repo/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getFreeDays, toggleFreeDay } from "@/actions/admin";
import { DAY_NAMES, MONTH_NAMES } from "@repo/domain/client";

interface FreeDayEntry {
  date: string;
  label: string | null;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstWeekday(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

export function FreeDaysCalendar({ initialFreeDays }: { initialFreeDays: FreeDayEntry[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [freeDays, setFreeDays] = useState<Set<string>>(
    () => new Set(initialFreeDays.map((d) => d.date))
  );
  const [loading, setLoading] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstWeekday = getFirstWeekday(year, month);

  async function changeMonth(delta: number) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    setYear(newYear);
    setMonth(newMonth);
    const data = await getFreeDays(newYear, newMonth);
    setFreeDays(new Set(data.map((d) => d.date)));
  }

  async function handleToggle(day: number) {
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setLoading(dateKey);
    try {
      const result = await toggleFreeDay(dateKey);
      setFreeDays((prev) => {
        const next = new Set(prev);
        if (result.isFree) next.add(dateKey);
        else next.delete(dateKey);
        return next;
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setLoading(null);
    }
  }

  const blanks = Array.from({ length: firstWeekday }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Días libres</h2>
          <p className="text-sm text-slate-400">
            Marca los días sin tareas. Los niños verán la ruta vacía con mensaje de descanso.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-[140px] text-center text-sm font-medium capitalize text-white">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
        {DAY_NAMES.map((name) => (
          <div key={name}>{name.slice(0, 3)}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {blanks.map((i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isFree = freeDays.has(dateKey);
          const isToday =
            today.getFullYear() === year &&
            today.getMonth() + 1 === month &&
            today.getDate() === day;

          return (
            <button
              key={day}
              type="button"
              disabled={loading === dateKey}
              onClick={() => handleToggle(day)}
              className={`relative flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                isFree
                  ? "bg-emerald-600/30 text-emerald-300 ring-1 ring-emerald-500/50"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-700"
              } ${isToday ? "ring-2 ring-violet-500" : ""} ${loading === dateKey ? "opacity-50" : ""}`}
              title={isFree ? "Día libre — clic para quitar" : "Clic para marcar como día libre"}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded bg-emerald-600/40 ring-1 ring-emerald-500/50" />
          Día libre (sin tareas)
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded ring-2 ring-violet-500" />
          Hoy
        </span>
      </div>
    </Card>
  );
}

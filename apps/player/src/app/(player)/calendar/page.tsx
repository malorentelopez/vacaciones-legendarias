import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getMissions, getBossBattles } from "@/actions/game";
import { Card, Badge } from "@repo/ui";

export default async function CalendarPage() {
  const session = await getSession();
  if (!session?.characterId) redirect("/");

  const [missions, bosses] = await Promise.all([getMissions(), getBossBattles()]);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const completedToday = missions.filter((m) => m.completed).length;
  const pendingToday = missions.filter((m) => !m.completed).length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-violet-300">Calendario</h1>

      <Card className="p-4">
        <h2 className="mb-4 text-xl font-bold">{monthNames[month]} {year}</h2>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
            <div key={d} className="p-2 font-medium">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = day === now.getDate();
            return (
              <div
                key={day}
                className={`rounded-lg p-2 ${isToday ? "bg-violet-600 text-white font-bold" : "hover:bg-slate-800"}`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <h3 className="font-bold mb-2">Hoy</h3>
          <div className="flex gap-2">
            <Badge variant="success">{completedToday} completadas</Badge>
            <Badge variant="warning">{pendingToday} pendientes</Badge>
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="font-bold mb-2">Boss del mes</h3>
          {bosses.filter((b) => b.month === month + 1).map((boss) => (
            <p key={boss.id} className="text-sm text-slate-300">{boss.title}</p>
          ))}
          {bosses.filter((b) => b.month === month + 1).length === 0 && (
            <p className="text-sm text-slate-400">Sin boss este mes</p>
          )}
        </Card>
      </div>
    </div>
  );
}

import { getTimeline } from "@/actions/admin";
import { Card, Badge } from "@repo/ui";

const eventLabels: Record<string, string> = {
  MISSION_COMPLETED: "Misión completada",
  XP_GAINED: "XP ganada",
  LEVEL_UP: "Subida de nivel",
  ACHIEVEMENT_UNLOCKED: "Logro desbloqueado",
  CRYSTALS_GAINED: "Cristales ganados",
  CRYSTALS_SPENT: "Cristales gastados",
  BOSS_COMPLETED: "Boss completado",
  PENALTY_APPLIED: "Penalización",
  WEEKLY_RESET: "Reset semanal",
  CHARACTER_CREATED: "Personaje creado",
};

export default async function TimelinePage() {
  const events = await getTimeline();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Timeline Global</h1>
      <div className="space-y-2">
        {events.map((event) => (
          <Card key={event.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Badge>{eventLabels[event.type] ?? event.type}</Badge>
                <span className="ml-2 text-sm text-violet-400">
                  {(event as { character?: { name: string } }).character?.name}
                </span>
                <p className="mt-1 text-xs text-slate-500">
                  {JSON.stringify(event.payload).slice(0, 80)}
                </p>
              </div>
              <time className="text-xs text-slate-500">
                {new Date(event.createdAt).toLocaleString("es-ES")}
              </time>
            </div>
          </Card>
        ))}
      </div>
      {events.length === 0 && (
        <p className="text-center text-slate-400">Sin eventos todavía</p>
      )}
    </div>
  );
}

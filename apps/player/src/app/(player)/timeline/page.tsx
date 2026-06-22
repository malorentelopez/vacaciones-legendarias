import { redirect } from "next/navigation";
import { getValidPlayerSession } from "@/lib/player-session";
import { getTimeline } from "@/actions/game";
import { Card, Badge } from "@repo/ui";

const eventLabels: Record<string, string> = {
  MISSION_COMPLETED: "Misión completada",
  XP_GAINED: "XP ganada",
  LEVEL_UP: "¡Subida de nivel!",
  ACHIEVEMENT_UNLOCKED: "Logro desbloqueado",
  CRYSTALS_GAINED: "Cristales ganados",
  CRYSTALS_SPENT: "Cristales gastados",
  BOSS_COMPLETED: "Boss completado",
  PENALTY_APPLIED: "Penalización",
  WEEKLY_RESET: "Reset semanal",
  CHARACTER_CREATED: "Personaje creado",
};

const eventVariants: Record<string, "default" | "success" | "warning" | "info"> = {
  MISSION_COMPLETED: "success",
  XP_GAINED: "info",
  LEVEL_UP: "warning",
  ACHIEVEMENT_UNLOCKED: "warning",
  CRYSTALS_GAINED: "warning",
  CRYSTALS_SPENT: "default",
  BOSS_COMPLETED: "success",
  PENALTY_APPLIED: "default",
  WEEKLY_RESET: "default",
  CHARACTER_CREATED: "info",
};

export default async function TimelinePage() {
  const session = await getValidPlayerSession();
  if (!session?.characterId) redirect("/");

  const events = await getTimeline();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-violet-300">Tu Historia</h1>
      <div className="space-y-3">
        {events.map((event) => (
          <Card key={event.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant={eventVariants[event.type] ?? "default"}>
                  {eventLabels[event.type] ?? event.type}
                </Badge>
                <p className="mt-1 text-sm text-slate-400">
                  {JSON.stringify(event.payload).slice(0, 100)}
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
        <p className="text-center text-slate-400">Tu aventura acaba de empezar...</p>
      )}
    </div>
  );
}

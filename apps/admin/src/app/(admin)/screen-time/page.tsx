import { getScreenTimeConfigs, getWeeklyStats } from "@/actions/admin";
import { Card, Badge } from "@repo/ui";

export default async function ScreenTimePage() {
  const [configs, weeklyStats] = await Promise.all([
    getScreenTimeConfigs(),
    getWeeklyStats(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tiempo de Pantalla</h1>

      <Card className="p-4">
        <h2 className="mb-4 font-bold">Configuración</h2>
        <div className="space-y-2">
          {configs.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
              <span>{c.minWeeklyPoints} - {c.maxWeeklyPoints} puntos</span>
              <Badge variant="info">{c.minutesAllowed} minutos</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-4 font-bold">Esta semana</h2>
        <div className="space-y-2">
          {weeklyStats.map((s) => (
            <div key={s.characterId} className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
              <span>{s.name}</span>
              <div className="flex gap-2">
                <Badge>{s.weeklyPoints} pts</Badge>
                <Badge variant="success">{s.screenTimeMinutes} min</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

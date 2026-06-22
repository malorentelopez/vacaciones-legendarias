import { redirect } from "next/navigation";
import { getValidPlayerSession } from "@/lib/player-session";
import { getAchievements } from "@/actions/game";
import { AchievementBadge, Badge } from "@repo/ui";

export default async function AchievementsPage() {
  const session = await getValidPlayerSession();
  if (!session?.characterId) redirect("/");

  const achievements = await getAchievements();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ color: "var(--theme-heading, #c4b5fd)" }}>
        Logros
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {achievements.map((a) => (
          <div key={a.id} className="space-y-2">
            <AchievementBadge
              title={a.title}
              description={a.description}
              unlocked={a.unlocked}
              unlockedAt={a.unlockedAt}
            />
            <div className="px-2">
              <Badge variant="warning">+{a.crystalReward} 💎</Badge>
              {a.progress && !a.unlocked && (
                <p className="mt-1 text-xs text-slate-400">
                  Progreso: {a.progress.completed}/{a.progress.total} misiones
                </p>
              )}
              {a.missions.length > 0 && (
                <ul className="mt-2 space-y-0.5">
                  {a.missions.map(({ mission }) => (
                    <li key={mission.id} className="text-xs text-slate-500">
                      • {mission.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
      {achievements.length === 0 && (
        <p className="text-center text-slate-400">Aún no hay logros configurados</p>
      )}
    </div>
  );
}

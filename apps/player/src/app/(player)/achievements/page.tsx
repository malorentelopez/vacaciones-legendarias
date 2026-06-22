import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAchievements } from "@/actions/game";
import { AchievementBadge } from "@repo/ui";

export default async function AchievementsPage() {
  const session = await getSession();
  if (!session?.characterId) redirect("/");

  const achievements = await getAchievements();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-violet-300">Logros</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {achievements.map((a) => (
          <AchievementBadge
            key={a.id}
            title={a.title}
            description={a.description}
            unlocked={a.unlocked}
            unlockedAt={a.unlockedAt}
          />
        ))}
      </div>
      {achievements.length === 0 && (
        <p className="text-center text-slate-400">Aún no hay logros configurados</p>
      )}
    </div>
  );
}

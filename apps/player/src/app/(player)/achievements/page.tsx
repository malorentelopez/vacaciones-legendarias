import { redirect } from "next/navigation";
import { getValidPlayerSession } from "@/lib/player-session";
import { getAchievements } from "@/actions/game";
import { AchievementsList } from "@/components/achievements-list";

export default async function AchievementsPage() {
  const session = await getValidPlayerSession();
  if (!session?.characterId) redirect("/");

  const achievements = await getAchievements();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--theme-heading, #c4b5fd)" }}>
          Logros
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Los logros se completan solos al cumplir los requisitos. Reclama los cristales cuando estén listos.
        </p>
      </div>
      <AchievementsList achievements={achievements} />
    </div>
  );
}

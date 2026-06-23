import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAchievements, getMissions, getCharacters, getAchievementUnlocks } from "@/actions/admin";
import { AchievementsManager } from "@/components/achievements-manager";

export default async function AchievementsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [achievements, missions, characters, unlocks] = await Promise.all([
    getAchievements(),
    getMissions(),
    getCharacters(),
    getAchievementUnlocks(),
  ]);
  return (
    <AchievementsManager
      achievements={achievements}
      missions={missions}
      characters={characters}
      unlocks={unlocks}
      familyId={session.familyId}
    />
  );
}

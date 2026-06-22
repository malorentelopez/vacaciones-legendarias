import { getAchievements } from "@/actions/admin";
import { AchievementsManager } from "@/components/achievements-manager";

export default async function AchievementsPage() {
  const achievements = await getAchievements();
  return <AchievementsManager achievements={achievements} />;
}

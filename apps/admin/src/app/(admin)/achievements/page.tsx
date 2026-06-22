import { getAchievements, getMissions } from "@/actions/admin";
import { AchievementsManager } from "@/components/achievements-manager";

export default async function AchievementsPage() {
  const [achievements, missions] = await Promise.all([getAchievements(), getMissions()]);
  return <AchievementsManager achievements={achievements} missions={missions} />;
}

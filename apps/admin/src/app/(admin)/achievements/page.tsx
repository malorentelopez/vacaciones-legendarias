import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAchievements, getMissions } from "@/actions/admin";
import { AchievementsManager } from "@/components/achievements-manager";

export default async function AchievementsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [achievements, missions] = await Promise.all([getAchievements(), getMissions()]);
  return (
    <AchievementsManager
      achievements={achievements}
      missions={missions}
      familyId={session.familyId}
    />
  );
}

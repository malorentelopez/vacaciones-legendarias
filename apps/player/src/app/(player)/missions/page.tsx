import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getMissions } from "@/actions/game";
import { MissionsList } from "@/components/missions-list";

export default async function MissionsPage() {
  const session = await getSession();
  if (!session?.characterId) redirect("/");

  const missions = await getMissions();
  return <MissionsList missions={missions} />;
}

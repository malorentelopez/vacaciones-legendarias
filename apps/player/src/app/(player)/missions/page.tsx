import { redirect } from "next/navigation";
import { getValidPlayerSession } from "@/lib/player-session";
import { getMissions } from "@/actions/game";
import { MissionsList } from "@/components/missions-list";

export default async function MissionsPage() {
  const session = await getValidPlayerSession();
  if (!session?.characterId) redirect("/");

  const missions = await getMissions();
  return <MissionsList missions={missions} />;
}

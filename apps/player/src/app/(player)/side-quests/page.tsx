import { redirect } from "next/navigation";
import { getValidPlayerSession } from "@/lib/player-session";
import { getSideQuests } from "@/actions/game";
import { SideQuestsList } from "@/components/side-quests-list";

export default async function SideQuestsPage() {
  const session = await getValidPlayerSession();
  if (!session?.characterId) redirect("/");

  const sideQuests = await getSideQuests();
  return <SideQuestsList sideQuests={sideQuests} />;
}

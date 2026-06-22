import { redirect } from "next/navigation";
import { getValidPlayerSession } from "@/lib/player-session";
import { getBossBattles } from "@/actions/game";
import { BossBattlesView } from "@/components/boss-battles-view";

export default async function BossBattlesPage() {
  const session = await getValidPlayerSession();
  if (!session?.characterId) redirect("/");

  const bosses = await getBossBattles();
  return <BossBattlesView bosses={bosses} />;
}

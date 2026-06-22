import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getBossBattles } from "@/actions/game";
import { BossBattlesView } from "@/components/boss-battles-view";

export default async function BossBattlesPage() {
  const session = await getSession();
  if (!session?.characterId) redirect("/");

  const bosses = await getBossBattles();
  return <BossBattlesView bosses={bosses} />;
}

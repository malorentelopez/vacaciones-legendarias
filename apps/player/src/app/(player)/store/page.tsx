import { redirect } from "next/navigation";
import { getValidPlayerSession } from "@/lib/player-session";
import { getRewards, getCharacter } from "@/actions/game";
import { StoreView } from "@/components/store-view";

export default async function StorePage() {
  const session = await getValidPlayerSession();
  if (!session?.characterId) redirect("/");

  const [rewards, character] = await Promise.all([getRewards(), getCharacter()]);
  return <StoreView rewards={rewards} crystals={character.crystals} level={character.level} />;
}

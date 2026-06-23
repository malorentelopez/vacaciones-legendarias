import { redirect } from "next/navigation";
import { getValidPlayerSession } from "@/lib/player-session";
import { getCharacter } from "@/actions/game";
import { getDragonChestStatus } from "@/actions/secrets";
import { DragonChestGame } from "@/components/secrets/dragon-chest-game";

export default async function DragonChestPage() {
  const session = await getValidPlayerSession();
  if (!session?.characterId) redirect("/");

  const [status, character] = await Promise.all([getDragonChestStatus(), getCharacter()]);

  if (!status.discovered || status.completed) {
    redirect("/");
  }

  return (
    <div className="py-4">
      <DragonChestGame themeKey={character.themeKey} />
    </div>
  );
}

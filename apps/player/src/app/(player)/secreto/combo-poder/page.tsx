import { redirect } from "next/navigation";
import { getValidPlayerSession } from "@/lib/player-session";
import { getMangaPowerComboStatus } from "@/actions/secrets";
import { MangaPowerComboGame } from "@/components/secrets/manga-power-combo-game";

export default async function MangaPowerComboPage() {
  const session = await getValidPlayerSession();
  if (!session?.characterId) redirect("/");

  const status = await getMangaPowerComboStatus();

  if (!status.discovered || status.completed) {
    redirect("/");
  }

  return (
    <div className="py-4">
      <MangaPowerComboGame />
    </div>
  );
}

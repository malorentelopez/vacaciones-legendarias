import { redirect } from "next/navigation";
import { getValidPlayerSession } from "@/lib/player-session";
import { getMangaPowerComboStatus } from "@/actions/secrets";
import { MangaPowerComboGameLazy } from "@/components/lazy/secret-games-lazy";

export default async function MangaPowerComboPage() {
  const session = await getValidPlayerSession();
  if (!session?.characterId) redirect("/");

  const status = await getMangaPowerComboStatus();

  if (!status.discovered || status.completed) {
    redirect("/");
  }

  return (
    <div className="py-4">
      <MangaPowerComboGameLazy />
    </div>
  );
}

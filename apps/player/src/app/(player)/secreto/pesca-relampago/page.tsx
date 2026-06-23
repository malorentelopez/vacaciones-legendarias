import { redirect } from "next/navigation";
import { getValidPlayerSession } from "@/lib/player-session";
import { getOceanFishingStatus } from "@/actions/secrets";
import { OceanFishingGame } from "@/components/secrets/ocean-fishing-game";

export default async function OceanFishingPage() {
  const session = await getValidPlayerSession();
  if (!session?.characterId) redirect("/");

  const status = await getOceanFishingStatus();

  if (!status.discovered || status.completed) {
    redirect("/");
  }

  return (
    <div className="py-4">
      <OceanFishingGame />
    </div>
  );
}

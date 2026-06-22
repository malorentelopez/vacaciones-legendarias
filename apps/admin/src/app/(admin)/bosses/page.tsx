import { getBossBattles } from "@/actions/admin";
import { BossesManager } from "@/components/bosses-manager";

export default async function BossesPage() {
  const bosses = await getBossBattles();
  return <BossesManager bosses={bosses} />;
}

import { getMissions } from "@/actions/admin";
import { MissionsManager } from "@/components/missions-manager";

export default async function MissionsPage() {
  const missions = await getMissions();
  return <MissionsManager missions={missions} />;
}

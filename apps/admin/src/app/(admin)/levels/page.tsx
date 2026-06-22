import { getLevels } from "@/actions/admin";
import { LevelsManager } from "@/components/levels-manager";

export default async function LevelsPage() {
  const levels = await getLevels();
  return <LevelsManager levels={levels} />;
}

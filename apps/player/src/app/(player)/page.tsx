import { redirect } from "next/navigation";
import { getValidPlayerSession } from "@/lib/player-session";
import { getCharacter, getFamilyCharacters, getAgenda, getSideQuests } from "@/actions/game";
import { getDragonChestStatus } from "@/actions/secrets";
import { CharacterSelector } from "@/components/character-selector";
import { DashboardView } from "@/components/dashboard-view";

export default async function DashboardPage() {
  const session = await getValidPlayerSession();
  if (!session) redirect("/login");

  if (!session.characterId) {
    const characters = await getFamilyCharacters();
    return <CharacterSelector characters={characters} />;
  }

  const [character, familyCharacters, agenda, sideQuests, dragonChestStatus] = await Promise.all([
    getCharacter(),
    getFamilyCharacters(),
    getAgenda().catch(() => null),
    getSideQuests().catch(() => []),
    getDragonChestStatus().catch(() => ({
      eligible: false,
      discovered: false,
      completed: false,
      discoveredAt: null,
    })),
  ]);

  const currentBlock = agenda?.blocks.find((b) => b.isCurrent);
  const completedQuests = agenda?.blocks.reduce(
    (sum, block) => sum + block.missions.filter((m) => m.completed).length,
    0
  ) ?? 0;
  const totalQuests = agenda?.blocks.reduce((sum, block) => sum + block.missions.length, 0) ?? 0;
  const completedSideQuests = sideQuests.filter((m) => m.completed).length;
  const totalSideQuests = sideQuests.length;

  return (
    <DashboardView
      character={character}
      familyCharacters={familyCharacters}
      routePreview={
        agenda
          ? {
              currentBlockTitle: currentBlock?.title,
              currentBlockIcon: currentBlock?.icon,
              completedQuests,
              totalQuests,
              totalStages: agenda.blocks.length,
            }
          : undefined
      }
      sideQuestsPreview={
        totalSideQuests > 0
          ? { completedSideQuests, totalSideQuests }
          : undefined
      }
      dragonChestStatus={dragonChestStatus}
    />
  );
}

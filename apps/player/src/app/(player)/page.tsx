import { redirect } from "next/navigation";
import { getValidPlayerSession } from "@/lib/player-session";
import { getCharacter, getFamilyCharacters, getAgenda } from "@/actions/game";
import { CharacterSelector } from "@/components/character-selector";
import { DashboardView } from "@/components/dashboard-view";
import { PlayerHeader } from "@/components/player-header";

export default async function DashboardPage() {
  const session = await getValidPlayerSession();
  if (!session) redirect("/login");

  if (!session.characterId) {
    const characters = await getFamilyCharacters();
    return <CharacterSelector characters={characters} />;
  }

  const [character, familyCharacters, agenda] = await Promise.all([
    getCharacter(),
    getFamilyCharacters(),
    getAgenda().catch(() => null),
  ]);

  const currentBlock = agenda?.blocks.find((b) => b.isCurrent);
  const completedQuests = agenda?.blocks.reduce(
    (sum, block) => sum + block.missions.filter((m) => m.completed).length,
    0
  ) ?? 0;
  const totalQuests = agenda?.blocks.reduce((sum, block) => sum + block.missions.length, 0) ?? 0;

  return (
    <>
      <PlayerHeader
        name={character.name}
        level={character.level}
        themeKey={character.themeKey}
        gender={character.gender}
        avatarBase={character.avatarBase}
        avatarConfig={character.avatarConfig}
      />
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
      />
    </>
  );
}

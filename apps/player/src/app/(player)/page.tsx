import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getCharacter, getFamilyCharacters } from "@/actions/game";
import { CharacterSelector } from "@/components/character-selector";
import { DashboardView } from "@/components/dashboard-view";
import { PlayerHeader } from "@/components/player-header";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (!session.characterId) {
    const characters = await getFamilyCharacters();
    return <CharacterSelector characters={characters} />;
  }

  const [character, familyCharacters] = await Promise.all([
    getCharacter(),
    getFamilyCharacters(),
  ]);

  return (
    <>
      <PlayerHeader name={character.name} />
      <DashboardView character={character} familyCharacters={familyCharacters} />
    </>
  );
}

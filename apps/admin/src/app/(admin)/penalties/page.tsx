import { getCharacters } from "@/actions/admin";
import { PenaltiesManager } from "@/components/penalties-manager";

export default async function PenaltiesPage() {
  const characters = await getCharacters();
  return (
    <PenaltiesManager
      characters={characters.map((c) => ({
        id: c.id,
        name: c.name,
        weeklyPoints: c.weeklyPoints,
      }))}
    />
  );
}

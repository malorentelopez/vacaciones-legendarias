import { getCharacters, getPenalties, getWeeklyStats } from "@/actions/admin";
import { PenaltiesManager } from "@/components/penalties-manager";

export default async function PenaltiesPage() {
  const [characters, penalties, weeklyStats] = await Promise.all([
    getCharacters(),
    getPenalties(),
    getWeeklyStats(),
  ]);

  const screenTimeByCharacter = new Map(
    weeklyStats.map((s) => [s.characterId, s.screenTimeMinutes])
  );

  const enrichCharacter = (c: {
    id: string;
    name: string;
    gender: "BOY" | "GIRL";
    themeKey: string;
    avatarBase: string;
    level: number;
    weeklyPoints: number;
    crystals: number;
  }) => ({
    ...c,
    screenTimeMinutes: screenTimeByCharacter.get(c.id) ?? 30,
  });

  return (
    <PenaltiesManager
      characters={characters.map(enrichCharacter)}
      initialPenalties={penalties.map((p) => ({
        ...p,
        character: enrichCharacter(p.character),
      }))}
    />
  );
}

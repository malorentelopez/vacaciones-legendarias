import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getCharacters, getMissions, getScheduleBlocks } from "@/actions/admin";
import { ScheduleManager } from "@/components/schedule-manager";

export default async function SchedulePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const characters = await getCharacters();
  if (characters.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Agenda semanal</h1>
        <p className="text-slate-400">Crea un personaje antes de definir su agenda.</p>
      </div>
    );
  }

  const characterId = characters[0].id;
  const [blocks, missions] = await Promise.all([
    getScheduleBlocks(characterId, "WEEKDAY"),
    getMissions(),
  ]);

  return (
    <ScheduleManager
      characters={characters.map((c) => ({ id: c.id, name: c.name }))}
      missions={missions.map((m) => ({ id: m.id, title: m.title, type: m.type }))}
      initialBlocks={blocks}
      initialCharacterId={characterId}
      initialDayType="WEEKDAY"
    />
  );
}

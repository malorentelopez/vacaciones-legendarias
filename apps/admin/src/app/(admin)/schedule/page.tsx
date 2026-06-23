import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getCharacters, getMissions, getScheduleBlocks, getFreeDays } from "@/actions/admin";
import { ScheduleManager } from "@/components/schedule-manager";
import { FreeDaysCalendar } from "@/components/free-days-calendar";

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
  const now = new Date();
  const [blocks, missions, freeDays] = await Promise.all([
    getScheduleBlocks(characterId, "WEEKDAY"),
    getMissions(),
    getFreeDays(now.getFullYear(), now.getMonth() + 1),
  ]);

  return (
    <div className="space-y-10">
      <ScheduleManager
        characters={characters.map((c) => ({ id: c.id, name: c.name }))}
        missions={missions.map((m) => ({ id: m.id, title: m.title, type: m.type }))}
        initialBlocks={blocks}
        initialCharacterId={characterId}
        initialDayType="WEEKDAY"
      />
      <FreeDaysCalendar initialFreeDays={freeDays} />
    </div>
  );
}

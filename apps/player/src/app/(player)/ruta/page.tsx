import { redirect } from "next/navigation";
import { getValidPlayerSession } from "@/lib/player-session";
import { getAgenda } from "@/actions/game";
import { DailyAgenda } from "@/components/daily-agenda";
import { formatAgendaDate } from "@repo/domain";

export default async function RutaPage() {
  const session = await getValidPlayerSession();
  if (!session?.characterId) redirect("/");

  const agenda = await getAgenda();
  const dayTypeLabel = agenda.dayType === "WEEKDAY" ? "Modo aventura" : "Modo explorador";

  const completedQuests = agenda.blocks.reduce(
    (sum, block) => sum + block.missions.filter((m) => m.completed).length,
    0
  );
  const totalQuests = agenda.blocks.reduce((sum, block) => sum + block.missions.length, 0);

  return (
    <DailyAgenda
      dateLabel={formatAgendaDate(new Date())}
      dayTypeLabel={dayTypeLabel}
      blocks={agenda.blocks}
      completedQuests={completedQuests}
      totalQuests={totalQuests}
    />
  );
}

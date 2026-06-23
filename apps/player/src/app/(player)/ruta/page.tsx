import { redirect } from "next/navigation";
import { getValidPlayerSession } from "@/lib/player-session";
import { getAgenda } from "@/actions/game";
import { DailyAgenda } from "@/components/daily-agenda";
import { formatAgendaDate, getDayScheduleTypeLabel } from "@repo/domain";

export default async function RutaPage() {
  const session = await getValidPlayerSession();
  if (!session?.characterId) redirect("/");

  const agenda = await getAgenda();
  const dayTypeLabel = getDayScheduleTypeLabel(agenda.dayType);

  const completedQuests = agenda.blocks.reduce(
    (sum, block) => sum + block.missions.filter((m) => m.completed).length,
    0
  );
  const totalQuests = agenda.blocks.reduce((sum, block) => sum + block.missions.length, 0);

  return (
    <DailyAgenda
      dateLabel={formatAgendaDate(new Date())}
      dayTypeLabel={dayTypeLabel}
      dayType={agenda.dayType}
      blocks={agenda.blocks}
      completedQuests={completedQuests}
      totalQuests={totalQuests}
      isFreeDay={agenda.isFreeDay}
      freeDayLabel={agenda.isFreeDay ? agenda.freeDayLabel : undefined}
    />
  );
}

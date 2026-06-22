import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAgenda } from "@/actions/game";
import { DailyAgenda } from "@/components/daily-agenda";
import { formatAgendaDate } from "@repo/domain";

export default async function CalendarPage() {
  const session = await getSession();
  if (!session?.characterId) redirect("/");

  const agenda = await getAgenda();
  const dayTypeLabel = agenda.dayType === "WEEKDAY" ? "Entre semana" : "Fin de semana";

  return (
    <DailyAgenda
      dateLabel={formatAgendaDate(new Date())}
      dayTypeLabel={dayTypeLabel}
      blocks={agenda.blocks}
    />
  );
}

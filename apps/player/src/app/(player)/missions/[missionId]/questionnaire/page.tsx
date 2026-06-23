import { redirect, notFound } from "next/navigation";
import { getValidPlayerSession } from "@/lib/player-session";
import { getQuestionnaireForMission } from "@/actions/game";
import { QuestionnaireForm } from "@/components/questionnaire-form";

export default async function MissionQuestionnairePage({
  params,
}: {
  params: Promise<{ missionId: string }>;
}) {
  const session = await getValidPlayerSession();
  if (!session?.characterId) redirect("/");

  const { missionId } = await params;

  try {
    const questionnaire = await getQuestionnaireForMission(missionId);
    return <QuestionnaireForm questionnaire={questionnaire} />;
  } catch {
    notFound();
  }
}

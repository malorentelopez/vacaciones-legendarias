import { getMissionQuestionnaires } from "@/actions/admin";
import { QuestionnaireManager } from "@/components/questionnaire-manager";
import { notFound } from "next/navigation";

export default async function MissionQuestionnairesPage({
  params,
}: {
  params: Promise<{ missionId: string }>;
}) {
  const { missionId } = await params;

  try {
    const data = await getMissionQuestionnaires(missionId);
    return <QuestionnaireManager initial={data} />;
  } catch {
    notFound();
  }
}

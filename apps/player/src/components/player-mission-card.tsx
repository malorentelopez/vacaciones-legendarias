"use client";

import Link from "next/link";
import { Badge } from "@repo/ui";
import type { QuestionnaireState } from "@repo/domain/client";
import { QuestCard } from "@/components/quest-card";
import { MANGA_COPY } from "@/lib/manga-copy";

export interface PlayerMission {
  id: string;
  title: string;
  description: string | null;
  type?: string;
  xpReward: number;
  crystalReward: number;
  completed: boolean;
  skill: { icon: string; color: string } | null;
  questionnaireState?: QuestionnaireState;
  activeQuestionnaire?: { id: string; title: string; questionCount: number };
}

export function PlayerMissionCard({
  mission,
  onComplete,
  loading,
  active,
}: {
  mission: PlayerMission;
  onComplete?: () => void;
  loading?: boolean;
  active?: boolean;
}) {
  const isQuestionnaire = mission.type === "QUESTIONNAIRE";

  if (!isQuestionnaire) {
    return (
      <QuestCard
        title={mission.title}
        description={mission.description}
        type={mission.type}
        xpReward={mission.xpReward}
        crystalReward={mission.crystalReward}
        skillIcon={mission.skill?.icon}
        skillColor={mission.skill?.color}
        completed={mission.completed}
        active={active}
        onComplete={mission.completed ? undefined : onComplete}
        loading={loading}
      />
    );
  }

  if (mission.completed) {
    return (
      <QuestCard
        title={mission.title}
        description={mission.description}
        type={mission.type}
        xpReward={mission.xpReward}
        crystalReward={mission.crystalReward}
        skillIcon={mission.skill?.icon}
        skillColor={mission.skill?.color}
        completed
      />
    );
  }

  if (mission.questionnaireState === "waiting") {
    return (
      <div className="manga-panel relative overflow-hidden bg-slate-900/80 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">{mission.title}</h3>
            {mission.description && (
              <p className="mt-1 text-sm text-slate-400">{mission.description}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="info">+{mission.xpReward} XP</Badge>
              {mission.crystalReward > 0 && (
                <Badge variant="warning">+{mission.crystalReward} 💎</Badge>
              )}
            </div>
          </div>
          <Badge variant="default">Próximamente</Badge>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Esperando el siguiente cuestionario. ¡Buen trabajo con el anterior!
        </p>
      </div>
    );
  }

  const questionnaireId = mission.activeQuestionnaire?.id;
  const subtitle = mission.activeQuestionnaire
    ? `${mission.activeQuestionnaire.title} · ${mission.activeQuestionnaire.questionCount} preguntas`
    : mission.description;

  return (
    <div className="manga-panel border-violet-500/40 bg-violet-500/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{mission.title}</h3>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="info">+{mission.xpReward} XP</Badge>
            {mission.crystalReward > 0 && (
              <Badge variant="warning">+{mission.crystalReward} 💎</Badge>
            )}
          </div>
        </div>
      </div>
      {questionnaireId && (
        <Link
          href={`/missions/${mission.id}/questionnaire`}
          className="font-display mt-4 inline-flex w-full items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium uppercase tracking-wide text-white hover:bg-violet-500 sm:w-auto"
        >
          {MANGA_COPY.acceptChallenge}
        </Link>
      )}
    </div>
  );
}

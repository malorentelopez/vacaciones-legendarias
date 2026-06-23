"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Badge } from "@repo/ui";
import { completeMission } from "@/actions/game";
import { PlayerMissionCard, type PlayerMission } from "@/components/player-mission-card";
import { FloatingRewardFx } from "@/components/manga/floating-reward-fx";
import { MangaHudBar } from "@/components/manga/manga-hud-bar";
import { themeProgressBar } from "@/lib/theme-ui";
import { useTheme } from "@/components/theme-provider";
import { useCelebrations } from "@/components/celebration-provider";
import { useMissionRewardFx } from "@/hooks/use-mission-reward-fx";
import { buildMissionRewardPayload } from "@/lib/mission-complete-fx";
import { triggerMissionPetReactions } from "@/lib/pet-reactions";
import { usePetReactions } from "@/components/pet-reaction-provider";
import { LegendaryRouteMap } from "@/components/manga/legendary-route-map";
import { DailyDialogueTrigger } from "@/components/daily-dialogue-trigger";
import type { DialogueScript } from "@/lib/dialogue-scripts";
import { MapPin, Scroll } from "lucide-react";

interface AgendaMission extends PlayerMission {}

interface AgendaBlock {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  startTime: string;
  endTime: string | null;
  section: string | null;
  isCurrent: boolean;
  missions: AgendaMission[];
}

function formatTimeRange(start: string, end: string | null) {
  return end ? `${start} – ${end}` : `${start} en adelante`;
}

export function DailyAgenda({
  dateLabel,
  dayTypeLabel,
  dayType,
  blocks,
  completedQuests = 0,
  totalQuests = 0,
  isFreeDay = false,
  freeDayLabel,
  routeCompleteDialogue,
  dayMoodEmoji,
}: {
  dateLabel: string;
  dayTypeLabel: string;
  dayType?: string;
  blocks: AgendaBlock[];
  completedQuests?: number;
  totalQuests?: number;
  isFreeDay?: boolean;
  freeDayLabel?: string | null;
  routeCompleteDialogue?: {
    dialogueKey: string;
    script: DialogueScript;
    portraitSrc: string;
    portraitAlt: string;
    alreadySeen: boolean;
  };
  dayMoodEmoji?: string;
}) {
  const router = useRouter();
  const theme = useTheme();
  const { applyGameFeedback } = useCelebrations();
  const { triggerReaction } = usePetReactions();
  const { activeFx, triggerMissionFx, clearMissionFx } = useMissionRewardFx();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleComplete(mission: AgendaMission) {
    setLoading(mission.id);
    try {
      const result = await completeMission(mission.id);
      triggerMissionFx(
        mission.id,
        buildMissionRewardPayload(mission, theme.key, {
          streak: result.streak,
          morningCombo: result.morningCombo,
        })
      );
      triggerMissionPetReactions(triggerReaction, { streak: result.streak });
      applyGameFeedback({ levelUp: result.levelUp });
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
    setLoading(null);
  }

  const currentBlock = blocks.find((b) => b.isCurrent);
  const questProgress = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

  function renderBlockMissions(block: AgendaBlock, isCurrent: boolean) {
    return block.missions.map((mission) => (
      <div key={mission.id} className="relative">
        <PlayerMissionCard
          mission={mission}
          active={isCurrent && !mission.completed}
          onComplete={mission.completed ? undefined : () => handleComplete(mission)}
          loading={loading === mission.id}
        />
        {activeFx?.missionId === mission.id && (
          <FloatingRewardFx {...activeFx.payload} onComplete={clearMissionFx} />
        )}
      </div>
    ));
  }

  if (isFreeDay || blocks.length === 0) {
    return (
      <div className="space-y-6">
        <header>
          <div className="theme-eyebrow mb-1 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <span>Ruta legendaria</span>
          </div>
          <h1 className="theme-page-title">
            {isFreeDay ? "¡Día de descanso!" : "Tu mapa está en blanco"}
          </h1>
          <p className="text-slate-400">{dateLabel}</p>
          {dayMoodEmoji && (
            <p className="text-2xl" aria-hidden>
              {dayMoodEmoji}
            </p>
          )}
        </header>
        <Card className="manga-panel p-8 text-center text-slate-400">
          <p className="font-display text-3xl text-amber-200">¡DÍA DE DESCANSO!</p>
          <Scroll className="theme-icon mx-auto mb-3 mt-4 h-10 w-10 opacity-60" />
          {isFreeDay
            ? (freeDayLabel ?? "Hoy no hay tareas. Disfruta del día libre y recarga energías para la próxima aventura.")
            : "Aún no hay etapas trazadas para hoy. Pide a tus padres que preparen tu ruta de aventura."}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {routeCompleteDialogue && (
        <DailyDialogueTrigger
          dialogueKey={routeCompleteDialogue.dialogueKey}
          script={routeCompleteDialogue.script}
          portraitSrc={routeCompleteDialogue.portraitSrc}
          portraitAlt={routeCompleteDialogue.portraitAlt}
          alreadySeen={routeCompleteDialogue.alreadySeen}
        />
      )}
      <header>
        <div className="theme-eyebrow mb-1 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <span>Ruta legendaria</span>
        </div>
        <h1 className="theme-page-title font-display tracking-wide">Mapa del día</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="text-slate-300">{dateLabel}</p>
          {dayMoodEmoji && (
            <span className="text-lg" aria-hidden title="Clima del día">
              {dayMoodEmoji}
            </span>
          )}
          <Badge variant="default">{dayTypeLabel}</Badge>
        </div>
      </header>

      {totalQuests > 0 && (
        <Card className="manga-panel manga-panel-power p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-display font-medium uppercase tracking-wide text-slate-300">Quests del día</span>
            <span className="theme-stat-muted font-medium">{completedQuests}/{totalQuests}</span>
          </div>
          <MangaHudBar value={questProgress} barStyle={themeProgressBar(theme)} showValue={false} />
        </Card>
      )}

      {currentBlock && (
        <Card className="manga-panel theme-surface route-map-active-callout p-4">
          <p className="theme-label mb-1">Etapa activa</p>
          <div className="flex items-center gap-2">
            {currentBlock.icon && <span className="text-2xl">{currentBlock.icon}</span>}
            <div>
              <p className="font-bold text-white">{currentBlock.title}</p>
              <p className="text-xs text-slate-400">{formatTimeRange(currentBlock.startTime, currentBlock.endTime)}</p>
            </div>
          </div>
        </Card>
      )}

      <LegendaryRouteMap
        blocks={blocks}
        dayType={dayType}
        renderMissions={(block, isCurrent) => {
          const fullBlock = blocks.find((item) => item.id === block.id);
          return fullBlock ? renderBlockMissions(fullBlock, isCurrent) : null;
        }}
      />
    </div>
  );
}

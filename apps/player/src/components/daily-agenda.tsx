"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Badge } from "@repo/ui";
import { completeMission } from "@/actions/game";
import { PlayerMissionCard, type PlayerMission } from "@/components/player-mission-card";
import { FloatingRewardFx } from "@/components/manga/floating-reward-fx";
import { MangaHudBar } from "@/components/manga/manga-hud-bar";
import { themeGlow, themeProgressBar } from "@/lib/theme-ui";
import { useTheme } from "@/components/theme-provider";
import { useCelebrations } from "@/components/celebration-provider";
import { useMissionRewardFx } from "@/hooks/use-mission-reward-fx";
import { Clock, MapPin, Scroll } from "lucide-react";

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
  blocks,
  completedQuests = 0,
  totalQuests = 0,
  isFreeDay = false,
  freeDayLabel,
}: {
  dateLabel: string;
  dayTypeLabel: string;
  blocks: AgendaBlock[];
  completedQuests?: number;
  totalQuests?: number;
  isFreeDay?: boolean;
  freeDayLabel?: string | null;
}) {
  const router = useRouter();
  const theme = useTheme();
  const { applyGameFeedback } = useCelebrations();
  const { activeFx, triggerMissionFx, clearMissionFx } = useMissionRewardFx(theme.key);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleComplete(mission: AgendaMission) {
    setLoading(mission.id);
    try {
      const result = await completeMission(mission.id);
      triggerMissionFx(mission.id, mission.type, mission.xpReward, mission.crystalReward);
      applyGameFeedback({ levelUp: result.levelUp });
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
    setLoading(null);
  }

  let lastSection: string | null = null;
  const currentBlock = blocks.find((b) => b.isCurrent);
  const questProgress = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

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
        </header>
        <Card className="p-8 text-center text-slate-400">
          <Scroll className="theme-icon mx-auto mb-3 h-10 w-10 opacity-60" />
          {isFreeDay
            ? (freeDayLabel ?? "Hoy no hay tareas. Disfruta del día libre y recarga energías para la próxima aventura.")
            : "Aún no hay etapas trazadas para hoy. Pide a tus padres que preparen tu ruta de aventura."}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="theme-eyebrow mb-1 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <span>Ruta legendaria</span>
        </div>
        <h1 className="theme-page-title font-display tracking-wide">Mapa del día</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="text-slate-300">{dateLabel}</p>
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
        <Card className="theme-surface p-4">
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

      <div className="relative space-y-4">
        <div className="theme-timeline-line absolute bottom-0 left-[19px] top-0 w-0.5" aria-hidden />

        {blocks.map((block, index) => {
          const showSection = block.section && block.section !== lastSection;
          if (showSection) lastSection = block.section;

          return (
            <div key={block.id}>
              {showSection && (
                <h2 className="theme-icon mb-3 mt-2 pl-10 text-sm font-semibold uppercase tracking-wide opacity-80">
                  ⚔ {block.section}
                </h2>
              )}

              <div className="relative pl-10">
                <div
                  className={`absolute left-3 top-5 flex h-4 w-4 items-center justify-center rounded-full border-2 text-[9px] font-bold ${
                    block.isCurrent
                      ? "theme-timeline-node-current"
                      : block.missions.length > 0 && block.missions.every((m) => m.completed)
                        ? "border-emerald-500 bg-emerald-600/80 text-white"
                        : "border-slate-600 bg-slate-800 text-slate-500"
                  }`}
                  style={block.isCurrent ? { boxShadow: themeGlow(theme) } : undefined}
                >
                  {index + 1}
                </div>

                <Card
                  className={`p-4 transition-colors ${block.isCurrent ? "theme-current-ring ring-2" : ""}`}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTimeRange(block.startTime, block.endTime)}
                    </span>
                    {block.isCurrent && <Badge variant="success">¡Ahora!</Badge>}
                    {block.missions.length > 0 && block.missions.every((m) => m.completed) && (
                      <Badge variant="success">Etapa superada</Badge>
                    )}
                  </div>

                  <div className="flex items-start gap-2">
                    {block.icon && <span className="text-xl leading-none">{block.icon}</span>}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white">{block.title}</h3>
                      {block.description && (
                        <p className="mt-1 text-sm text-slate-400">{block.description}</p>
                      )}
                    </div>
                  </div>

                  {block.missions.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-slate-700/50 pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-400/90">Quests de la etapa</p>
                      {block.missions.map((mission) => (
                        <div key={mission.id} className="relative">
                          <PlayerMissionCard
                            mission={mission}
                            active={block.isCurrent && !mission.completed}
                            onComplete={mission.completed ? undefined : () => handleComplete(mission)}
                            loading={loading === mission.id}
                          />
                          {activeFx?.missionId === mission.id && (
                            <FloatingRewardFx {...activeFx.payload} onComplete={clearMissionFx} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

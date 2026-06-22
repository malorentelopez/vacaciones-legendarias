"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Badge, MissionCard } from "@repo/ui";
import { completeMission } from "@/actions/game";
import { Clock } from "lucide-react";

interface AgendaMission {
  id: string;
  title: string;
  description: string | null;
  xpReward: number;
  crystalReward: number;
  completed: boolean;
  skill: { icon: string; color: string } | null;
}

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
}: {
  dateLabel: string;
  dayTypeLabel: string;
  blocks: AgendaBlock[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleComplete(missionId: string) {
    setLoading(missionId);
    try {
      await completeMission(missionId);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
    setLoading(null);
  }

  let lastSection: string | null = null;

  if (blocks.length === 0) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-violet-300">Agenda</h1>
          <p className="text-slate-400">{dateLabel}</p>
        </header>
        <Card className="p-8 text-center text-slate-400">
          Tu agenda de hoy aún no está configurada. Pide a tus padres que la definan.
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-violet-300">Agenda</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="text-slate-300">{dateLabel}</p>
          <Badge variant="default">{dayTypeLabel}</Badge>
        </div>
      </header>

      <div className="relative space-y-4">
        <div className="absolute bottom-0 left-[19px] top-0 w-0.5 bg-slate-700/60" aria-hidden />

        {blocks.map((block) => {
          const showSection = block.section && block.section !== lastSection;
          if (showSection) lastSection = block.section;

          return (
            <div key={block.id}>
              {showSection && (
                <h2 className="mb-3 mt-2 pl-10 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {block.section}
                </h2>
              )}

              <div className="relative pl-10">
                <div
                  className={`absolute left-3 top-5 h-3 w-3 rounded-full border-2 ${
                    block.isCurrent
                      ? "border-violet-400 bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.6)]"
                      : "border-slate-600 bg-slate-800"
                  }`}
                />

                <Card
                  className={`p-4 transition-colors ${
                    block.isCurrent ? "ring-2 ring-violet-500/50 bg-violet-950/20" : ""
                  }`}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTimeRange(block.startTime, block.endTime)}
                    </span>
                    {block.isCurrent && <Badge variant="success">Ahora</Badge>}
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
                      {block.missions.map((mission) => (
                        <MissionCard
                          key={mission.id}
                          title={mission.title}
                          description={mission.description}
                          xpReward={mission.xpReward}
                          crystalReward={mission.crystalReward}
                          skillIcon={mission.skill?.icon}
                          skillColor={mission.skill?.color}
                          completed={mission.completed}
                          onComplete={mission.completed ? undefined : () => handleComplete(mission.id)}
                          loading={loading === mission.id}
                        />
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

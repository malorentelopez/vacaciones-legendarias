"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeMission } from "@/actions/game";
import { PlayerMissionCard, type PlayerMission } from "@/components/player-mission-card";
import { useCelebrations } from "@/components/celebration-provider";

export function SideQuestsList({ sideQuests }: { sideQuests: PlayerMission[] }) {
  const router = useRouter();
  const { applyGameFeedback } = useCelebrations();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleComplete(missionId: string) {
    setLoading(missionId);
    try {
      const result = await completeMission(missionId);
      applyGameFeedback({ levelUp: result.levelUp });
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
    setLoading(null);
  }

  const pending = sideQuests.filter((m) => !m.completed);
  const completed = sideQuests.filter((m) => m.completed);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="theme-page-title">Side Quests</h1>
        <p className="mt-1 text-sm text-slate-400">
          Puedes hacerlas cuando quieras, una vez al día cada una.
        </p>
      </div>

      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-300">Pendientes</h2>
          {pending.map((mission) => (
            <PlayerMissionCard
              key={mission.id}
              mission={mission}
              onComplete={() => handleComplete(mission.id)}
              loading={loading === mission.id}
            />
          ))}
        </section>
      )}

      {completed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-emerald-400">Completadas hoy</h2>
          {completed.map((mission) => (
            <PlayerMissionCard key={mission.id} mission={mission} />
          ))}
        </section>
      )}

      {sideQuests.length === 0 && (
        <p className="text-center text-slate-400">No hay Side Quests disponibles</p>
      )}
    </div>
  );
}

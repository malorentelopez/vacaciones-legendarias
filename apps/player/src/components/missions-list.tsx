"use client";

import { useState } from "react";
import { MissionCard } from "@repo/ui";
import { completeMission } from "@/actions/game";

interface Mission {
  id: string;
  title: string;
  description: string | null;
  xpReward: number;
  crystalReward: number;
  completed: boolean;
  skill: { icon: string; color: string } | null;
}

export function MissionsList({ missions }: { missions: Mission[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleComplete(missionId: string) {
    setLoading(missionId);
    try {
      await completeMission(missionId);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
    setLoading(null);
  }

  const pending = missions.filter((m) => !m.completed);
  const completed = missions.filter((m) => m.completed);

  return (
    <div className="space-y-6">
      <h1 className="theme-page-title">Misiones</h1>

      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-300">Pendientes</h2>
          {pending.map((mission) => (
            <MissionCard
              key={mission.id}
              title={mission.title}
              description={mission.description}
              xpReward={mission.xpReward}
              crystalReward={mission.crystalReward}
              skillIcon={mission.skill?.icon}
              skillColor={mission.skill?.color}
              completed={false}
              onComplete={() => handleComplete(mission.id)}
              loading={loading === mission.id}
            />
          ))}
        </section>
      )}

      {completed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-emerald-400">Completadas</h2>
          {completed.map((mission) => (
            <MissionCard
              key={mission.id}
              title={mission.title}
              description={mission.description}
              xpReward={mission.xpReward}
              crystalReward={mission.crystalReward}
              skillIcon={mission.skill?.icon}
              skillColor={mission.skill?.color}
              completed
            />
          ))}
        </section>
      )}

      {missions.length === 0 && (
        <p className="text-center text-slate-400">No hay misiones disponibles</p>
      )}
    </div>
  );
}

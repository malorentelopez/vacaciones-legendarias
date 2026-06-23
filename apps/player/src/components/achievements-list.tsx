"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AchievementBadge, Badge, Button } from "@repo/ui";
import { claimAchievement } from "@/actions/game";
import { RewardCelebration } from "@/components/reward-celebration";

interface AchievementItem {
  id: string;
  title: string;
  description: string | null;
  crystalReward: number;
  unlocked: boolean;
  claimed: boolean;
  claimable: boolean;
  unlockedAt?: Date;
  claimedAt?: Date | null;
  progress?: { completed: number; total: number };
  missions: { mission: { id: string; title: string } }[];
  targetMission?: { id: string; title: string } | null;
  targetMissionCompletions?: number | null;
  isManual?: boolean;
}

export function AchievementsList({ achievements: initial }: { achievements: AchievementItem[] }) {
  const router = useRouter();
  const [achievements, setAchievements] = useState(initial);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<{
    title: string;
    amount: number;
    achievementId: string;
  } | null>(null);

  async function handleClaim(achievement: AchievementItem) {
    setClaimingId(achievement.id);
    try {
      await claimAchievement(achievement.id);
      setAchievements((prev) =>
        prev.map((a) =>
          a.id === achievement.id
            ? { ...a, claimed: true, claimable: false, claimedAt: new Date() }
            : a
        )
      );
      setCelebration({
        title: achievement.title,
        amount: achievement.crystalReward,
        achievementId: achievement.id,
      });
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al reclamar");
    } finally {
      setClaimingId(null);
    }
  }

  if (achievements.length === 0) {
    return <p className="text-center text-slate-400">Aún no hay logros configurados</p>;
  }

  return (
    <>
      {celebration && (
        <RewardCelebration
          title={celebration.title}
          amount={celebration.amount}
          onComplete={() => setCelebration(null)}
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {achievements.map((a) => (
        <div
          key={a.id}
          className={`space-y-2 ${celebration?.achievementId === a.id ? "achievement-just-claimed" : ""}`}
        >
          <AchievementBadge
            className={a.claimable ? "achievement-claimable" : undefined}
            title={a.title}
            description={a.description}
            unlocked={a.unlocked}
            claimed={a.claimed}
            unlockedAt={a.unlockedAt}
            claimedAt={a.claimedAt}
          />
          <div className="px-2">
            {a.crystalReward > 0 && (
              <Badge variant={a.claimed ? "success" : "warning"}>
                +{a.crystalReward} 💎{a.claimed ? " reclamados" : ""}
              </Badge>
            )}
            {a.isManual && !a.unlocked && (
              <p className="mt-1 text-xs text-slate-500">
                Tus padres lo activarán cuando comprueben que lo has conseguido.
              </p>
            )}
            {a.progress && !a.unlocked && !a.isManual && (
              <p className="mt-1 text-xs text-slate-400">
                Progreso: {a.progress.completed}/{a.progress.total}
                {a.targetMission ? ` · ${a.targetMission.title}` : " misiones"}
              </p>
            )}
            {a.missions.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {a.missions.map(({ mission }) => (
                  <li key={mission.id} className="text-xs text-slate-500">
                    • {mission.title}
                  </li>
                ))}
              </ul>
            )}
            {a.claimable && (
              <Button
                size="sm"
                className="mt-3 w-full transition-transform active:scale-95"
                onClick={() => handleClaim(a)}
                disabled={claimingId === a.id || celebration !== null}
              >
                {claimingId === a.id ? "Reclamando..." : `¡Reclamar ${a.crystalReward} 💎!`}
              </Button>
            )}
          </div>
        </div>
      ))}
      </div>
    </>
  );
}

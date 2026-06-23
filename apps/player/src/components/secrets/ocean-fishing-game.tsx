"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui";
import { completeOceanFishing } from "@/actions/secrets";
import { RewardCelebration } from "@/components/reward-celebration";
import { useCelebrations } from "@/components/celebration-provider";
import { FishingPhase } from "./fishing-phase";

type Phase = "intro" | "fishing" | "victory" | "error";

export function OceanFishingGame() {
  const router = useRouter();
  const { applyGameFeedback } = useCelebrations();
  const [phase, setPhase] = useState<Phase>("intro");
  const [reward, setReward] = useState<{ title: string; crystals: number; xp: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [pendingLevelUp, setPendingLevelUp] = useState<{ newLevel: number; crystalReward: number } | null>(null);

  async function handleVictory(fishCaught: number) {
    if (fishCaught < 8) return;

    setSubmitting(true);
    setError(null);
    try {
      const result = await completeOceanFishing({ fishCaught });
      setReward({
        title: result.achievement.title,
        crystals: result.achievement.crystalReward,
        xp: result.xpReward,
      });
      setPendingLevelUp(result.levelUp ?? null);
      setPhase("victory");
      setShowCelebration(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar la pesca");
      setPhase("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      {phase === "intro" && (
        <div className="manga-panel p-6 text-center">
          <p className="text-5xl" aria-hidden>
            🎣🌊
          </p>
          <h1 className="mt-4 font-display text-2xl tracking-wide text-cyan-200">Pesca relámpago</h1>
          <p className="mt-2 text-sm text-slate-400">
            Los cristales brillaron en 42… ¡el mar ha abierto su secreto!
          </p>
          <Button
            type="button"
            className="mt-6 w-full bg-cyan-600 hover:bg-cyan-500"
            onClick={() => setPhase("fishing")}
          >
            ¡A pescar!
          </Button>
        </div>
      )}

      {phase === "fishing" && <FishingPhase onComplete={(fishCaught) => void handleVictory(fishCaught)} />}

      {submitting && (
        <p className="text-center text-sm text-cyan-300" role="status">
          El capitán cuenta tu botín…
        </p>
      )}

      {phase === "error" && error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
          <p className="text-red-300">{error}</p>
          <Button type="button" variant="outline" className="mt-3" onClick={() => setPhase("fishing")}>
            Reintentar
          </Button>
        </div>
      )}

      {phase === "victory" && reward && (
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6 text-center">
          <p className="text-5xl" aria-hidden>
            🐟✨
          </p>
          <h2 className="mt-4 font-display text-2xl text-cyan-200">¡Red legendaria!</h2>
          <div className="mt-6 space-y-2 text-sm text-slate-200">
            <p>🏆 Logro: {reward.title}</p>
            <p>🐟 Pececito compañero desbloqueado</p>
            <p>💎 +{reward.crystals} cristales</p>
            <p>⚡ +{reward.xp} XP</p>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Button type="button" className="w-full" onClick={() => router.push("/avatar")}>
              Equipar pececito
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => router.push("/")}>
              Volver al campamento
            </Button>
          </div>
        </div>
      )}

      {showCelebration && reward && (
        <RewardCelebration
          title={reward.title}
          amount={reward.crystals}
          onComplete={() => {
            setShowCelebration(false);
            if (pendingLevelUp) {
              applyGameFeedback({ levelUp: pendingLevelUp });
              setPendingLevelUp(null);
            }
          }}
        />
      )}
    </div>
  );
}

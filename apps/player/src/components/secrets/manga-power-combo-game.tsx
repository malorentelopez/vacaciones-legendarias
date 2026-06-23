"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui";
import { completeMangaPowerCombo } from "@/actions/secrets";
import { RewardCelebration } from "@/components/reward-celebration";
import { useCelebrations } from "@/components/celebration-provider";
import { SimonComboPhase } from "./simon-combo-phase";

type Phase = "intro" | "combo" | "victory" | "error";

export function MangaPowerComboGame() {
  const router = useRouter();
  const { applyGameFeedback } = useCelebrations();
  const [phase, setPhase] = useState<Phase>("intro");
  const [reward, setReward] = useState<{ title: string; crystals: number; xp: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [pendingLevelUp, setPendingLevelUp] = useState<{ newLevel: number; crystalReward: number } | null>(null);

  async function handleVictory(score: number) {
    setSubmitting(true);
    setError(null);
    try {
      const result = await completeMangaPowerCombo({ sequenceScore: score });
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
      setError(err instanceof Error ? err.message : "No se pudo completar el combo");
      setPhase("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      {phase === "intro" && (
        <div className="manga-panel manga-panel-power p-6 text-center">
          <p className="text-5xl" aria-hidden>
            ⚡🥷
          </p>
          <h1 className="mt-4 font-display text-2xl tracking-wide text-pink-200">Combo de poder</h1>
          <p className="mt-2 text-sm text-slate-400">
            Repite la secuencia secreta de iconos para despertar tu bandana legendaria.
          </p>
          <Button
            type="button"
            className="mt-6 w-full bg-pink-600 hover:bg-pink-500"
            onClick={() => setPhase("combo")}
          >
            ¡Activar combo!
          </Button>
        </div>
      )}

      {phase === "combo" && <SimonComboPhase onComplete={(score) => void handleVictory(score)} />}

      {submitting && (
        <p className="text-center text-sm text-pink-300" role="status">
          Canalizando poder…
        </p>
      )}

      {phase === "error" && error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
          <p className="text-red-300">{error}</p>
          <Button type="button" variant="outline" className="mt-3" onClick={() => setPhase("combo")}>
            Reintentar
          </Button>
        </div>
      )}

      {phase === "victory" && reward && (
        <div className="rounded-2xl border border-pink-500/30 bg-pink-500/10 p-6 text-center">
          <p className="text-5xl" aria-hidden>
            🥷✨
          </p>
          <h2 className="mt-4 font-display text-2xl text-pink-200">¡Combo despertado!</h2>
          <div className="mt-6 space-y-2 text-sm text-slate-200">
            <p>🏆 Logro: {reward.title}</p>
            <p>🥷 Bandana del Héroe desbloqueada</p>
            <p>💎 +{reward.crystals} cristales</p>
            <p>⚡ +{reward.xp} XP</p>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Button type="button" className="w-full" onClick={() => router.push("/avatar")}>
              Equipar bandana
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

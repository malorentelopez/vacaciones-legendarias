"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui";
import { completeDragonChest } from "@/actions/secrets";
import { RewardCelebration } from "@/components/reward-celebration";
import { useCelebrations } from "@/components/celebration-provider";
import { MemoryPhase } from "./memory-phase";
import { RhythmPhase } from "./rhythm-phase";

type Phase = "intro" | "memory" | "rhythm" | "victory" | "error";

interface DragonChestGameProps {
  themeKey: string;
}

export function DragonChestGame({ themeKey }: DragonChestGameProps) {
  const router = useRouter();
  const { applyGameFeedback } = useCelebrations();
  const [phase, setPhase] = useState<Phase>("intro");
  const [memoryTurns, setMemoryTurns] = useState(0);
  const [rhythmScore, setRhythmScore] = useState(0);
  const [reward, setReward] = useState<{
    title: string;
    crystals: number;
    xp: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [pendingLevelUp, setPendingLevelUp] = useState<{ newLevel: number; crystalReward: number } | null>(
    null
  );

  async function handleVictory(turns: number, score: number) {
    setSubmitting(true);
    setError(null);
    try {
      const result = await completeDragonChest({ memoryTurns: turns, rhythmScore: score });
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
      setError(err instanceof Error ? err.message : "No se pudo abrir el cofre");
      setPhase("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <span className={phase === "intro" || phase === "memory" ? "text-amber-400" : "text-emerald-400"}>①</span>
        <span className="h-px w-8 bg-slate-700" />
        <span className={phase === "rhythm" ? "text-amber-400" : phase === "victory" ? "text-emerald-400" : ""}>②</span>
      </div>

      {phase === "intro" && (
        <div className="rounded-2xl border border-amber-500/20 bg-slate-900/80 p-6 text-center">
          <p className="text-5xl" aria-hidden>
            🐉
          </p>
          <h1 className="mt-4 text-2xl font-bold text-amber-200">El Cofre del Dragón</h1>
          <p className="mt-2 text-sm text-slate-400">Dos pruebas te separan del tesoro legendario</p>
          <ul className="mt-6 space-y-2 text-left text-sm text-slate-300">
            <li>① Memoria del campamento — encuentra las parejas</li>
            <li>② Latido del dragón — sigue el ritmo</li>
          </ul>
          <Button
            type="button"
            className="mt-6 w-full bg-amber-600 hover:bg-amber-500"
            onClick={() => setPhase("memory")}
          >
            Empezar prueba
          </Button>
        </div>
      )}

      {phase === "memory" && (
        <MemoryPhase
          themeKey={themeKey}
          onComplete={(turns) => {
            setMemoryTurns(turns);
            setPhase("rhythm");
          }}
        />
      )}

      {phase === "rhythm" && (
        <RhythmPhase
          onComplete={(score) => {
            setRhythmScore(score);
            void handleVictory(memoryTurns, score);
          }}
        />
      )}

      {submitting && (
        <p className="text-center text-sm text-amber-300" role="status">
          El dragón abre el cofre…
        </p>
      )}

      {phase === "error" && error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
          <p className="text-red-300">{error}</p>
          <Button type="button" variant="outline" className="mt-3" onClick={() => setPhase("rhythm")}>
            Reintentar
          </Button>
        </div>
      )}

      {phase === "victory" && reward && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
          <p className="text-5xl" aria-hidden>
            🐉💨
          </p>
          <h2 className="mt-4 text-2xl font-bold text-emerald-300">¡Cofre abierto!</h2>
          <p className="mt-2 text-sm text-slate-300">Has demostrado memoria y valor.</p>
          <div className="mt-6 space-y-2 text-sm text-slate-200">
            <p>🏆 Logro: {reward.title}</p>
            <p>🎩 Gorro del Dragón desbloqueado</p>
            <p>💎 +{reward.crystals} cristales</p>
            <p>⚡ +{reward.xp} XP</p>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Button type="button" className="w-full" onClick={() => router.push("/avatar")}>
              Equipar gorro
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

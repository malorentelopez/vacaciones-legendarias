"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@repo/ui";
import { POWER_COMBO_ICONS } from "@repo/domain/client";
import { MangaSfx } from "@/components/manga/manga-sfx";

const SEQUENCE_LENGTH = 4;
const SHOW_STEP_MS = 650;
const GAP_MS = 220;

function buildSequence(length: number): string[] {
  const ids = POWER_COMBO_ICONS.map((icon) => icon.id);
  return Array.from({ length }, () => ids[Math.floor(Math.random() * ids.length)]!);
}

interface SimonComboPhaseProps {
  onComplete: (score: number) => void;
}

export function SimonComboPhase({ onComplete }: SimonComboPhaseProps) {
  const sequence = useMemo(() => buildSequence(SEQUENCE_LENGTH), []);
  const [phase, setPhase] = useState<"demo" | "play" | "done">("demo");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [failed, setFailed] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    for (const timer of timersRef.current) clearTimeout(timer);
    timersRef.current = [];
  };

  const playSequence = useCallback(() => {
    clearTimers();
    setPhase("demo");
    setActiveId(null);
    setFailed(false);
    setPlayerIndex(0);
    setScore(0);

    let delay = 400;
    sequence.forEach((id, index) => {
      timersRef.current.push(
        setTimeout(() => setActiveId(id), delay)
      );
      timersRef.current.push(
        setTimeout(() => setActiveId(null), delay + SHOW_STEP_MS)
      );
      delay += SHOW_STEP_MS + GAP_MS;
      if (index === sequence.length - 1) {
        timersRef.current.push(
          setTimeout(() => setPhase("play"), delay + 200)
        );
      }
    });
  }, [sequence]);

  useEffect(() => {
    playSequence();
    return clearTimers;
  }, [playSequence]);

  function handlePick(id: string) {
    if (phase !== "play") return;

    const expected = sequence[playerIndex];
    if (id !== expected) {
      setFailed(true);
      setPhase("done");
      return;
    }

    const nextScore = score + 1;
    setScore(nextScore);
    setActiveId(id);
    setTimeout(() => setActiveId(null), 180);

    if (nextScore >= sequence.length) {
      setPhase("done");
      onComplete(nextScore);
      return;
    }

    setPlayerIndex(playerIndex + 1);
  }

  return (
    <div className="manga-panel manga-panel-power space-y-4 p-5">
      <div className="text-center">
        <p className="font-display text-2xl tracking-wide text-pink-200">Combo de poder</p>
        <p className="mt-1 text-sm text-slate-400">
          {phase === "demo"
            ? "Memoriza la secuencia…"
            : phase === "play"
              ? `Tu turno: ${score}/${sequence.length}`
              : failed
                ? "¡Fallaste! Inténtalo otra vez"
                : "¡Combo perfecto!"}
        </p>
      </div>

      {phase === "done" && !failed && (
        <MangaSfx text="¡COMBO!" className="text-center" />
      )}

      <div className="grid grid-cols-3 gap-3">
        {POWER_COMBO_ICONS.map((icon) => {
          const isActive = activeId === icon.id;
          return (
            <button
              key={icon.id}
              type="button"
              onClick={() => handlePick(icon.id)}
              disabled={phase !== "play"}
              className={`rounded-xl border-2 p-4 text-center transition-transform ${
                isActive
                  ? "scale-105 border-pink-400 bg-pink-500/20 shadow-[0_0_20px_rgba(244,114,182,0.35)]"
                  : "border-slate-600 bg-slate-900/70 hover:border-pink-400/40 disabled:opacity-60"
              }`}
            >
              <span className="text-3xl" aria-hidden>
                {icon.emoji}
              </span>
              <p className="mt-1 text-xs text-slate-400">{icon.label}</p>
            </button>
          );
        })}
      </div>

      {failed && (
        <Button type="button" className="w-full" onClick={playSequence}>
          Reintentar combo
        </Button>
      )}
    </div>
  );
}

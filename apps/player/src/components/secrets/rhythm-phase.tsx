"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@repo/ui";

interface RhythmPhaseProps {
  onComplete: (score: number) => void;
}

const BEATS = 4;
const BEAT_INTERVAL_MS = 900;
const HIT_WINDOW_MS = 500;

export function RhythmPhase({ onComplete }: RhythmPhaseProps) {
  const [score, setScore] = useState(0);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  const [finished, setFinished] = useState(false);
  const [failed, setFailed] = useState(false);
  const reportedRef = useRef(false);
  const canHitRef = useRef(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    for (const timer of timeoutsRef.current) clearTimeout(timer);
    timeoutsRef.current = [];
  };

  const startRound = useCallback(() => {
    clearTimers();
    reportedRef.current = false;
    setScore(0);
    setCurrentBeat(0);
    setFinished(false);
    setFailed(false);
    setPlaying(true);

    const schedule = (fn: () => void, ms: number) => {
      const timer = setTimeout(fn, ms);
      timeoutsRef.current.push(timer);
    };

    schedule(() => {
      for (let i = 0; i < BEATS; i++) {
        schedule(() => {
          setCurrentBeat(i + 1);
          setPulsing(true);
          canHitRef.current = true;
          schedule(() => setPulsing(false), 180);
          schedule(() => {
            canHitRef.current = false;
          }, HIT_WINDOW_MS);
        }, i * BEAT_INTERVAL_MS);
      }

      schedule(() => {
        setPlaying(false);
        setFinished(true);
      }, BEATS * BEAT_INTERVAL_MS + 200);
    }, 400);
  }, []);

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    if (!finished || reportedRef.current) return;
    reportedRef.current = true;
    if (score >= 3) {
      onComplete(score);
    } else {
      setFailed(true);
    }
  }, [finished, score, onComplete]);

  function handleTap() {
    if (!playing || !canHitRef.current) return;
    canHitRef.current = false;
    setScore((value) => value + 1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Latido del dragón</h2>
        <p className="mt-1 text-sm text-slate-400">Pulsa cuando el círculo brille al ritmo</p>
      </div>

      {!playing && !finished && (
        <div className="flex flex-col items-center gap-4 py-8">
          <p className="text-sm text-slate-300">Necesitas 3 de 4 aciertos</p>
          <Button type="button" onClick={startRound} className="bg-amber-600 hover:bg-amber-500">
            Escuchar al dragón
          </Button>
        </div>
      )}

      {(playing || finished) && (
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="flex gap-2">
            {Array.from({ length: BEATS }, (_, index) => (
              <span
                key={index}
                className={`h-3 w-3 rounded-full ${
                  index < score ? "bg-emerald-400" : index < currentBeat ? "bg-amber-400/50" : "bg-slate-600"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleTap}
            disabled={!playing}
            className={`relative flex h-40 w-40 items-center justify-center rounded-full border-4 transition-transform ${
              pulsing ? "scale-110 border-amber-400 bg-amber-500/20" : "border-amber-600/50 bg-slate-800"
            } ${playing ? "cursor-pointer" : "cursor-default opacity-80"}`}
          >
            <span className="text-4xl" aria-hidden>
              🐉
            </span>
            {pulsing && (
              <span className="absolute inset-0 animate-ping rounded-full border-2 border-amber-400/60" />
            )}
          </button>

          <p className="text-lg font-semibold text-amber-200">{playing ? "¡LATIR!" : "Evaluando…"}</p>
          <p className="text-sm text-slate-400">
            Aciertos: {score}/{BEATS}
          </p>
        </div>
      )}

      {failed && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
          <p className="font-semibold text-red-300">El dragón se ha dormido un momento…</p>
          <Button type="button" variant="outline" className="mt-3" onClick={startRound}>
            Reintentar
          </Button>
        </div>
      )}
    </div>
  );
}

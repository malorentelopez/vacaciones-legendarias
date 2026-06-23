"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@repo/ui";
import { MangaSfx } from "@/components/manga/manga-sfx";

const DURATION_MS = 30_000;
const SPAWN_MS = 900;
const MIN_FISH = 8;

interface Fish {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

const FISH_EMOJIS = ["🐟", "🐠", "🦈", "🐡"];

interface FishingPhaseProps {
  onComplete: (fishCaught: number) => void;
}

export function FishingPhase({ onComplete }: FishingPhaseProps) {
  const [playing, setPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION_MS / 1000);
  const [fish, setFish] = useState<Fish[]>([]);
  const [caught, setCaught] = useState(0);
  const [finished, setFinished] = useState(false);
  const nextId = useRef(0);
  const caughtRef = useRef(0);

  const endGame = useCallback(() => {
    setPlaying(false);
    setFinished(true);
    onComplete(caughtRef.current);
  }, [onComplete]);

  useEffect(() => {
    if (!playing) return;

    const tick = setInterval(() => {
      setTimeLeft((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);

    const spawn = setInterval(() => {
      setFish((current) => {
        if (current.length >= 6) return current;
        const id = nextId.current++;
        return [
          ...current,
          {
            id,
            x: 8 + Math.random() * 72,
            y: 10 + Math.random() * 70,
            emoji: FISH_EMOJIS[Math.floor(Math.random() * FISH_EMOJIS.length)]!,
          },
        ];
      });
    }, SPAWN_MS);

    const timeout = setTimeout(() => {
      clearInterval(tick);
      clearInterval(spawn);
      endGame();
    }, DURATION_MS);

    return () => {
      clearInterval(tick);
      clearInterval(spawn);
      clearTimeout(timeout);
    };
  }, [playing, endGame]);

  function startGame() {
    nextId.current = 0;
    caughtRef.current = 0;
    setFish([]);
    setCaught(0);
    setFinished(false);
    setTimeLeft(DURATION_MS / 1000);
    setPlaying(true);
  }

  function catchFish(id: number) {
    if (!playing) return;
    setFish((current) => current.filter((item) => item.id !== id));
    caughtRef.current += 1;
    setCaught(caughtRef.current);
  }

  return (
    <div className="manga-panel space-y-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-2xl tracking-wide text-cyan-200">Pesca relámpago</p>
          <p className="text-sm text-slate-400">¡Toca los peces antes de que se escapen!</p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl text-amber-200">{timeLeft}s</p>
          <p className="text-xs text-slate-400">
            {caught} / {MIN_FISH} mín.
          </p>
        </div>
      </div>

      {!playing && !finished && (
        <div className="rounded-xl border border-cyan-500/20 bg-slate-900/70 p-6 text-center">
          <p className="text-4xl" aria-hidden>
            🎣
          </p>
          <p className="mt-3 text-sm text-slate-300">
            Tienes 30 segundos para atrapar al menos {MIN_FISH} peces.
          </p>
          <Button type="button" className="mt-4 w-full bg-cyan-600 hover:bg-cyan-500" onClick={startGame}>
            ¡Lanzar la red!
          </Button>
        </div>
      )}

      {playing && (
        <div className="fishing-pond relative h-64 overflow-hidden rounded-xl border-2 border-cyan-500/30 bg-gradient-to-b from-cyan-900/40 to-slate-900">
          {fish.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => catchFish(item.id)}
              className="fishing-fish absolute text-3xl transition-transform hover:scale-125 active:scale-95"
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              aria-label="Atrapar pez"
            >
              {item.emoji}
            </button>
          ))}
        </div>
      )}

      {finished && (
        <div className="text-center">
          {caught >= MIN_FISH ? (
            <MangaSfx text="¡SPLASH!" className="text-center" />
          ) : (
            <p className="text-sm text-red-300">Necesitas al menos {MIN_FISH} peces. ¡Inténtalo otra vez!</p>
          )}
          <Button type="button" variant="outline" className="mt-3 w-full" onClick={startGame}>
            Reintentar pesca
          </Button>
        </div>
      )}
    </div>
  );
}

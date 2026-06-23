"use client";

import { useEffect, useMemo, useState } from "react";
import { MEMORY_PAIRS_BY_THEME } from "@repo/domain/client";

interface MemoryPhaseProps {
  themeKey: string;
  onComplete: (turns: number) => void;
}

interface Card {
  id: number;
  pairId: number;
  emoji: string;
  label: string;
}

function buildDeck(themeKey: string): Card[] {
  const pairs = MEMORY_PAIRS_BY_THEME[themeKey] ?? MEMORY_PAIRS_BY_THEME.manga;
  const cards: Card[] = [];
  let id = 0;
  for (let pairId = 0; pairId < pairs.length; pairId++) {
    const pair = pairs[pairId]!;
    cards.push({ id: id++, pairId, emoji: pair.emoji, label: pair.label });
    cards.push({ id: id++, pairId, emoji: pair.emoji, label: pair.label });
  }
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j]!, cards[i]!];
  }
  return cards;
}

export function MemoryPhase({ themeKey, onComplete }: MemoryPhaseProps) {
  const deck = useMemo(() => buildDeck(themeKey), [themeKey]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [turns, setTurns] = useState(0);
  const [lock, setLock] = useState(false);

  useEffect(() => {
    if (matched.size === deck.length / 2) {
      const timer = setTimeout(() => onComplete(turns), 600);
      return () => clearTimeout(timer);
    }
  }, [matched.size, deck.length, turns, onComplete]);

  function handleFlip(cardId: number) {
    if (lock) return;
    const card = deck.find((c) => c.id === cardId);
    if (!card || matched.has(card.pairId) || flipped.includes(cardId)) return;

    const nextFlipped = [...flipped, cardId];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setTurns((t) => t + 1);
      setLock(true);
      const [a, b] = nextFlipped.map((id) => deck.find((c) => c.id === id)!);
      if (a.pairId === b.pairId) {
        setMatched((prev) => new Set([...prev, a.pairId]));
        setFlipped([]);
        setLock(false);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLock(false);
        }, 800);
      }
    }
  }

  const allMatched = matched.size === deck.length / 2;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Memoria del campamento</h2>
        <p className="mt-1 text-sm text-slate-400">Encuentra las parejas del verano</p>
        <p className="mt-2 text-sm text-slate-300">
          Turno {turns} · Parejas: {matched.size}/{deck.length / 2}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {deck.map((card) => {
          const isFaceUp = flipped.includes(card.id) || matched.has(card.pairId);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleFlip(card.id)}
              disabled={lock || matched.has(card.pairId)}
              className={`memory-card flex aspect-square flex-col items-center justify-center rounded-2xl border text-2xl transition-all ${
                isFaceUp
                  ? "border-amber-500/40 bg-slate-800"
                  : "border-slate-600 bg-slate-800/80 hover:border-amber-500/30"
              }`}
              aria-label={isFaceUp ? card.label : "Carta oculta"}
            >
              {isFaceUp ? (
                <>
                  <span>{card.emoji}</span>
                  <span className="mt-1 text-[10px] text-slate-400">{card.label}</span>
                </>
              ) : (
                <span className="text-slate-500">?</span>
              )}
            </button>
          );
        })}
      </div>

      {allMatched && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
          <p className="font-semibold text-emerald-300">¡Memoria legendaria!</p>
          <p className="mt-1 text-sm text-slate-400">El cofre cruje… pero aún falta algo.</p>
        </div>
      )}
    </div>
  );
}

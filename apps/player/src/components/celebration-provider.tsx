"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { BossVictoryInfo, LevelUpInfo } from "@repo/domain/client";
import { LevelUpCelebration } from "@/components/level-up-celebration";
import { BossVictoryCelebration } from "@/components/boss-victory-celebration";
import { usePetReactionsOptional } from "@/components/pet-reaction-provider";

type CelebrationItem =
  | { type: "levelUp"; data: LevelUpInfo }
  | { type: "bossVictory"; data: BossVictoryInfo };

interface CelebrationContextValue {
  celebrateLevelUp: (info: LevelUpInfo) => void;
  celebrateBossVictory: (info: BossVictoryInfo) => void;
  applyGameFeedback: (feedback: {
    levelUp?: LevelUpInfo | null;
    bossVictory?: BossVictoryInfo | null;
  }) => void;
}

const CelebrationContext = createContext<CelebrationContextValue | null>(null);

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const queueRef = useRef<CelebrationItem[]>([]);
  const [current, setCurrent] = useState<CelebrationItem | null>(null);
  const petReactions = usePetReactionsOptional();

  const showNext = useCallback(() => {
    queueRef.current.shift();
    setCurrent(queueRef.current[0] ?? null);
  }, []);

  const enqueue = useCallback((item: CelebrationItem) => {
    const wasEmpty = queueRef.current.length === 0;
    queueRef.current.push(item);
    if (wasEmpty) {
      setCurrent(item);
    }
  }, []);

  const celebrateLevelUp = useCallback(
    (info: LevelUpInfo) => {
      petReactions?.triggerReaction("spin");
      enqueue({ type: "levelUp", data: info });
    },
    [enqueue, petReactions]
  );

  const celebrateBossVictory = useCallback(
    (info: BossVictoryInfo) => enqueue({ type: "bossVictory", data: info }),
    [enqueue]
  );

  const applyGameFeedback = useCallback(
    (feedback: { levelUp?: LevelUpInfo | null; bossVictory?: BossVictoryInfo | null }) => {
      if (feedback.bossVictory) {
        celebrateBossVictory(feedback.bossVictory);
      }
      if (feedback.levelUp) {
        celebrateLevelUp(feedback.levelUp);
      }
    },
    [celebrateBossVictory, celebrateLevelUp]
  );

  const value = useMemo(
    () => ({ celebrateLevelUp, celebrateBossVictory, applyGameFeedback }),
    [celebrateLevelUp, celebrateBossVictory, applyGameFeedback]
  );

  return (
    <CelebrationContext.Provider value={value}>
      {children}
      {current?.type === "levelUp" && (
        <LevelUpCelebration
          newLevel={current.data.newLevel}
          crystalReward={current.data.crystalReward}
          onComplete={showNext}
        />
      )}
      {current?.type === "bossVictory" && (
        <BossVictoryCelebration
          title={current.data.title}
          xpReward={current.data.xpReward}
          crystalReward={current.data.crystalReward}
          onComplete={showNext}
        />
      )}
    </CelebrationContext.Provider>
  );
}

export function useCelebrations() {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error("useCelebrations debe usarse dentro de CelebrationProvider");
  }
  return context;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type PetReaction = "jump" | "spin" | "fire" | "sleep";

interface PetReactionContextValue {
  petEmoji: string | null;
  reaction: PetReaction | null;
  triggerReaction: (reaction: PetReaction) => void;
}

const PetReactionContext = createContext<PetReactionContextValue | null>(null);

export function PetReactionProvider({
  petEmoji = null,
  children,
}: {
  petEmoji?: string | null;
  children: ReactNode;
}) {
  const [reaction, setReaction] = useState<PetReaction | null>(null);

  const triggerReaction = useCallback(
    (next: PetReaction) => {
      if (!petEmoji) return;
      setReaction(next);
      window.setTimeout(() => setReaction(null), 900);
    },
    [petEmoji]
  );

  const value = useMemo(
    () => ({ petEmoji, reaction, triggerReaction }),
    [petEmoji, reaction, triggerReaction]
  );

  return <PetReactionContext.Provider value={value}>{children}</PetReactionContext.Provider>;
}

export function usePetReactions() {
  const context = useContext(PetReactionContext);
  if (!context) {
    throw new Error("usePetReactions debe usarse dentro de PetReactionProvider");
  }
  return context;
}

export function usePetReactionsOptional() {
  return useContext(PetReactionContext);
}

"use client";

import { cn } from "@repo/ui";
import { usePetReactionsOptional, type PetReaction } from "@/components/pet-reaction-provider";

interface PetCompanionProps {
  emoji: string;
  reaction?: PetReaction | null;
  size?: "sm" | "md";
  className?: string;
}

const sizeClasses = {
  sm: "h-7 w-7 text-base",
  md: "h-8 w-8 text-lg",
} as const;

const reactionClasses: Record<PetReaction, string> = {
  jump: "pet-reaction-jump",
  spin: "pet-reaction-spin",
  fire: "pet-reaction-fire",
  sleep: "pet-reaction-sleep",
};

export function PetCompanion({
  emoji,
  reaction: reactionProp,
  size = "md",
  className,
}: PetCompanionProps) {
  const context = usePetReactionsOptional();
  const reaction = reactionProp ?? context?.reaction ?? null;
  const showHeart = reaction === "jump";

  return (
    <span
      className={cn(
        "pet-companion pointer-events-none absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-slate-900/95 shadow-lg ring-2 ring-white/15",
        sizeClasses[size],
        reaction && reactionClasses[reaction],
        className
      )}
      aria-hidden
    >
      <span className="leading-none">{emoji}</span>
      {showHeart && <span className="pet-companion-heart">💕</span>}
      {reaction === "sleep" && (
        <span className="pet-companion-zzz text-[10px] font-bold text-slate-300">Zzz</span>
      )}
    </span>
  );
}

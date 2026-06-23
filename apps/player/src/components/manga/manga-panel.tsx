"use client";

import { cn } from "@repo/ui";
import type { ReactNode } from "react";

interface MangaPanelProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "quest" | "boss" | "dialogue";
  active?: boolean;
  completed?: boolean;
}

const variantClasses: Record<NonNullable<MangaPanelProps["variant"]>, string> = {
  default: "manga-panel",
  quest: "manga-panel manga-panel-quest",
  boss: "manga-panel manga-panel-boss",
  dialogue: "manga-panel manga-panel-dialogue",
};

export function MangaPanel({
  children,
  className,
  variant = "default",
  active,
  completed,
}: MangaPanelProps) {
  return (
    <div
      className={cn(
        variantClasses[variant],
        active && "manga-panel-active",
        completed && "manga-panel-completed",
        className
      )}
    >
      {children}
    </div>
  );
}

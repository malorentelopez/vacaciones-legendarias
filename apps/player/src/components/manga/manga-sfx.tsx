"use client";

import { useEffect } from "react";
import { cn } from "@repo/ui";

interface MangaSfxProps {
  text: string;
  className?: string;
  onComplete?: () => void;
  durationMs?: number;
}

export function MangaSfx({ text, className, onComplete, durationMs = 700 }: MangaSfxProps) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, onComplete]);

  return (
    <span className={cn("manga-sfx pointer-events-none", className)} aria-hidden>
      {text}
    </span>
  );
}

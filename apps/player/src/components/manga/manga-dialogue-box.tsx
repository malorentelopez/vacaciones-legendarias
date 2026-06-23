"use client";

import { useCallback, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn, CharacterPortrait } from "@repo/ui";
import { MangaPanel } from "@/components/manga/manga-panel";
import { MangaActionButton } from "@/components/manga/manga-action-button";

export interface MangaDialogueBoxProps {
  portraitSrc: string;
  portraitAlt: string;
  speaker: string;
  lines: string[];
  onDismiss: () => void;
  className?: string;
}

export function MangaDialogueBox({
  portraitSrc,
  portraitAlt,
  speaker,
  lines,
  onDismiss,
  className,
}: MangaDialogueBoxProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const isLastLine = lineIndex >= lines.length - 1;
  const currentLine = lines[lineIndex] ?? "";

  const advance = useCallback(() => {
    if (isLastLine) {
      onDismiss();
      return;
    }
    setLineIndex((index) => index + 1);
  }, [isLastLine, onDismiss]);

  return (
    <div
      className={cn("manga-dialogue-overlay fixed inset-x-0 bottom-0 z-50 px-3 pb-20 md:pb-6", className)}
      role="dialog"
      aria-labelledby="manga-dialogue-speaker"
      aria-live="polite"
    >
      <MangaPanel variant="dialogue" className="manga-dialogue-box mx-auto max-w-4xl">
        <button
          type="button"
          className="flex w-full items-start gap-3 p-4 text-left sm:gap-4 sm:p-5"
          onClick={advance}
        >
          <CharacterPortrait
            imageSrc={portraitSrc}
            alt={portraitAlt}
            size="md"
            className="manga-dialogue-portrait shrink-0 rounded-xl"
          />

          <div className="min-w-0 flex-1">
            <p id="manga-dialogue-speaker" className="font-display text-sm uppercase tracking-wide text-amber-200 sm:text-base">
              {speaker}
            </p>
            <div className="my-2 h-px bg-gradient-to-r from-amber-400/50 via-slate-600 to-transparent" />
            <p className="min-h-[3.5rem] text-sm leading-relaxed text-slate-100 sm:text-base">{currentLine}</p>
            <div className="mt-3 flex justify-end">
              <MangaActionButton
                type="button"
                size="sm"
                variant="secondary"
                className="pointer-events-none gap-1"
                tabIndex={-1}
                aria-hidden
              >
                {isLastLine ? "¡Vamos!" : "Siguiente"}
                {!isLastLine && <ChevronDown className="h-4 w-4" />}
              </MangaActionButton>
            </div>
          </div>
        </button>
      </MangaPanel>
    </div>
  );
}

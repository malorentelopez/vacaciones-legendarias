"use client";

import { useState, useTransition } from "react";
import { markDialogueSeen } from "@/actions/dialogues";
import { MangaDialogueBox } from "@/components/manga/manga-dialogue-box";
import type { DialogueScript } from "@/lib/dialogue-scripts";

interface DailyDialogueTriggerProps {
  dialogueKey: string;
  script: DialogueScript;
  portraitSrc: string;
  portraitAlt: string;
  alreadySeen: boolean;
}

export function DailyDialogueTrigger({
  dialogueKey,
  script,
  portraitSrc,
  portraitAlt,
  alreadySeen,
}: DailyDialogueTriggerProps) {
  const [visible, setVisible] = useState(!alreadySeen);
  const [, startTransition] = useTransition();

  if (!visible || script.lines.length === 0) return null;

  function handleDismiss() {
    setVisible(false);
    startTransition(async () => {
      await markDialogueSeen(dialogueKey);
    });
  }

  return (
    <MangaDialogueBox
      portraitSrc={portraitSrc}
      portraitAlt={portraitAlt}
      speaker={script.speaker}
      lines={script.lines}
      onDismiss={handleDismiss}
    />
  );
}

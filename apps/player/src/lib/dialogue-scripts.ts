import type { DayScheduleType } from "@repo/database";
import { formatSummerChapter, type SummerChapter } from "@repo/domain";

export type DialogueTrigger = "morning" | "route-complete";

export interface DialogueScript {
  speaker: string;
  lines: string[];
}

const NARRATOR_BY_THEME: Record<string, string> = {
  manga: "Sensei del verano",
  adventure: "Guía del gremio",
  ocean: "Capitán del puerto",
};

export function getNarratorName(themeKey: string): string {
  return NARRATOR_BY_THEME[themeKey] ?? NARRATOR_BY_THEME.manga!;
}

export function getDialogueKey(dateKey: string, trigger: DialogueTrigger): string {
  return `${dateKey}-${trigger}`;
}

export function hasSeenDialogue(
  dialoguesSeen: Record<string, boolean> | undefined,
  dialogueKey: string
): boolean {
  return dialoguesSeen?.[dialogueKey] === true;
}

interface MorningDialogueParams {
  themeKey: string;
  characterName: string;
  chapter: SummerChapter;
  dayType: DayScheduleType;
}

export function buildMorningDialogue({
  themeKey,
  characterName,
  chapter,
  dayType,
}: MorningDialogueParams): DialogueScript {
  const speaker = getNarratorName(themeKey);
  const chapterLine = formatSummerChapter(chapter);
  const greeting =
    dayType === "WEEKEND"
      ? `¡Buenos días, ${characterName}! Hoy el campamento descansa contigo.`
      : `¡Buenos días, ${characterName}! Tu poder crece con cada misión del día.`;

  const lines = [greeting, `${chapterLine}. ¡El entrenamiento de hoy comienza!`];

  if (dayType === "FRIDAY") {
    lines.push("¡Viernes legendario! Demuestra tu poder esta semana en la ruta del día.");
  } else if (dayType === "WEEKEND") {
    lines.push("Explora, descansa y disfruta: las misiones extra siguen ahí si te apetece aventura.");
  } else {
    lines.push("Abre la ruta legendaria y conquista la etapa activa. ¡Tú puedes!");
  }

  return { speaker, lines };
}

export function buildRouteCompleteDialogue({
  themeKey,
  characterName,
  dayType,
}: {
  themeKey: string;
  characterName: string;
  dayType: DayScheduleType;
}): DialogueScript {
  const speaker = getNarratorName(themeKey);

  if (dayType === "WEEKEND") {
    return {
      speaker,
      lines: [
        `¡Increíble, ${characterName}!`,
        "Has completado todas las quests del día libre. ¡Eres una leyenda del verano!",
      ],
    };
  }

  return {
    speaker,
    lines: [
      `¡Mañana legendaria completada, ${characterName}!`,
      "Todas las misiones de la ruta están hechas. Las tardes son tuyas: descansa como una campeona.",
    ],
  };
}

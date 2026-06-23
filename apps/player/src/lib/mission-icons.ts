import { getMangaUiTheme } from "./manga-ui-theme";

export const MISSION_TYPE_ICONS: Record<string, string> = {
  HABIT: "⚡",
  CREATIVE: "🎨",
  LEARNING: "📖",
  CHORE: "🧹",
  CUSTOM: "✨",
  QUESTIONNAIRE: "❓",
};

export const MISSION_TYPE_SFX: Record<string, string> = {
  HABIT: "¡ZAS!",
  CREATIVE: "¡CREA!",
  LEARNING: "¡SABER!",
  CHORE: "¡LISTO!",
  CUSTOM: "¡EXTRA!",
  QUESTIONNAIRE: "¡DESAFÍO!",
};

export function getMissionIcon(type?: string): string {
  if (!type) return "⚔️";
  return MISSION_TYPE_ICONS[type] ?? "⚔️";
}

export function getMissionSfx(type?: string, themeKey = "manga"): string {
  if (type && MISSION_TYPE_SFX[type]) {
    return MISSION_TYPE_SFX[type]!;
  }
  return getMangaUiTheme(themeKey).completeSfx;
}

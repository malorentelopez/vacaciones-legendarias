import type { EventType } from "@repo/database";

export const EVENT_LABELS: Record<EventType, string> = {
  MISSION_COMPLETED: "Misión completada",
  XP_GAINED: "XP ganada",
  LEVEL_UP: "Subida de nivel",
  ACHIEVEMENT_UNLOCKED: "Logro desbloqueado",
  ACHIEVEMENT_CLAIMED: "Logro reclamado",
  CRYSTALS_GAINED: "Cristales ganados",
  CRYSTALS_SPENT: "Cristales gastados",
  BOSS_COMPLETED: "Reto del mes completado",
  PENALTY_APPLIED: "Penalización",
  WEEKLY_RESET: "Reset semanal",
  CHARACTER_CREATED: "Personaje creado",
  QUESTIONNAIRE_COMPLETED: "Cuestionario aprobado",
  SECRET_DISCOVERED: "Secreto descubierto",
  SECRET_COMPLETED: "Secreto completado",
  STREAK_MILESTONE: "Hito de racha",
  COMBO_MORNING: "Combo matinal",
};

export function formatEventDetail(type: EventType, payload: unknown): string {
  const p = payload as Record<string, unknown> | null;
  if (!p) return "";

  switch (type) {
    case "MISSION_COMPLETED":
      return String(p.missionTitle ?? "");
    case "LEVEL_UP":
      return `Nivel ${p.newLevel ?? "?"}`;
    case "ACHIEVEMENT_UNLOCKED":
    case "ACHIEVEMENT_CLAIMED":
      return String(p.title ?? "");
    case "CRYSTALS_GAINED":
    case "CRYSTALS_SPENT":
      return `${p.amount ?? 0} 💎`;
    case "XP_GAINED":
      return `+${p.amount ?? 0} XP`;
    case "PENALTY_APPLIED":
      if (p.crystals) return `-${p.crystals} 💎`;
      return `-${p.points ?? 0} pts`;
    case "BOSS_COMPLETED":
      return String(p.title ?? "");
    case "CHARACTER_CREATED":
      return String(p.name ?? "");
    case "QUESTIONNAIRE_COMPLETED":
      return String(p.questionnaireTitle ?? p.missionTitle ?? "");
    case "SECRET_DISCOVERED":
    case "SECRET_COMPLETED":
      if (p.secretKey === "dragon-chest") return "Cofre del dragón";
      if (p.secretKey === "manga-power-combo") return "Combo de poder manga";
      if (p.secretKey === "ocean-fishing") return "Pesca relámpago";
      return String(p.secretKey ?? "");
    case "STREAK_MILESTONE":
      return `${p.days ?? "?"} días · +${p.crystals ?? 0} 💎`;
    case "COMBO_MORNING":
      return `+${p.crystals ?? 0} 💎`;
    default:
      return "";
  }
}

export function formatRelativeTime(date: Date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `hace ${diffHours} h`;
  return new Date(date).toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

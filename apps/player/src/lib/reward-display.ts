export function getRewardEmoji(title: string): string {
  const normalized = title.toLowerCase();

  if (normalized.includes("helado")) return "🍦";
  if (normalized.includes("pantalla") || normalized.includes("videojuego")) return "🎮";
  if (normalized.includes("salida") || normalized.includes("actividad")) return "🎢";
  if (normalized.includes("película") || normalized.includes("cine")) return "🍿";
  if (normalized.includes("dulce") || normalized.includes("chuche")) return "🍬";

  return "🎁";
}

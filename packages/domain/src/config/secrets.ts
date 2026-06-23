export const DRAGON_CHEST_SECRET = {
  key: "dragon-chest",
  route: "/secreto/cofre-dragon",
  achievementIcon: "secret-dragon-chest",
  accessoryKey: "hat_dragon",
  minLevel: 1,
  xpReward: 25,
  minPlaySeconds: 20,
} as const;

export type SecretKey = typeof DRAGON_CHEST_SECRET.key;

export const MEMORY_PAIRS_BY_THEME: Record<string, { emoji: string; label: string }[]> = {
  adventure: [
    { emoji: "📚", label: "Leer" },
    { emoji: "🛡️", label: "Rutina" },
    { emoji: "🏃", label: "Ejercicio" },
  ],
  manga: [
    { emoji: "📖", label: "Manga" },
    { emoji: "🎨", label: "Dibujo" },
    { emoji: "⚡", label: "Entreno" },
  ],
  ocean: [
    { emoji: "🌊", label: "Mar" },
    { emoji: "🏴‍☠️", label: "Aventura" },
    { emoji: "🐚", label: "Tesoro" },
  ],
};

export const ACCESSORY_DISPLAY: Record<string, { emoji: string; label: string }> = {
  default: { emoji: "🧙", label: "Aventurero" },
  hat_star: { emoji: "⭐", label: "Gorro Estrella" },
  pet_cat: { emoji: "🐱", label: "Gato Compañero" },
  hat_dragon: { emoji: "🐉", label: "Gorro del Dragón" },
};

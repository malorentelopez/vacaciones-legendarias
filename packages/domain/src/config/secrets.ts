export const DRAGON_CHEST_SECRET = {
  key: "dragon-chest",
  route: "/secreto/cofre-dragon",
  achievementIcon: "secret-dragon-chest",
  accessoryKey: "hat_dragon",
  minLevel: 1,
  xpReward: 25,
  minPlaySeconds: 20,
} as const;

export const MANGA_POWER_COMBO_SECRET = {
  key: "manga-power-combo",
  route: "/secreto/combo-poder",
  achievementIcon: "secret-manga-combo",
  accessoryKey: "bandana_hero",
  minLevel: 2,
  xpReward: 20,
  minPlaySeconds: 10,
  requiredTheme: "manga",
  sequenceLength: 4,
} as const;

export const OCEAN_FISHING_SECRET = {
  key: "ocean-fishing",
  route: "/secreto/pesca-relampago",
  achievementIcon: "secret-ocean-fishing",
  accessoryKey: "pet_fish",
  minLevel: 2,
  xpReward: 20,
  minPlaySeconds: 25,
  requiredTheme: "ocean",
  requiredCrystals: 42,
  minFishCaught: 8,
} as const;

export type SecretKey =
  | typeof DRAGON_CHEST_SECRET.key
  | typeof MANGA_POWER_COMBO_SECRET.key
  | typeof OCEAN_FISHING_SECRET.key;

export const POWER_COMBO_ICONS = [
  { id: "bolt", emoji: "⚡", label: "Entreno" },
  { id: "art", emoji: "🎨", label: "Dibujo" },
  { id: "book", emoji: "📖", label: "Manga" },
] as const;

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
  bandana_hero: { emoji: "🥷", label: "Bandana del Héroe" },
  pet_fish: { emoji: "🐟", label: "Pececito Compañero" },
};

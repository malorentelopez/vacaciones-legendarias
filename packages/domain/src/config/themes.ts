export type CharacterGender = "boy" | "girl";

export interface ThemeAvatar {
  key: string;
  emoji: string;
  name: string;
}

export interface ThemeConfig {
  key: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bgFrom: string;
    bgVia: string;
    bgTo: string;
    navActive: string;
    heading: string;
  };
  avatars: Record<CharacterGender, ThemeAvatar[]>;
}

export const THEMES: Record<string, ThemeConfig> = {
  adventure: {
    key: "adventure",
    name: "Aventura",
    description: "Magos, caballeros y exploradores",
    colors: {
      primary: "#8b5cf6",
      secondary: "#22c55e",
      accent: "#a78bfa",
      bgFrom: "#0f172a",
      bgVia: "#2e1065",
      bgTo: "#0f172a",
      navActive: "#7c3aed",
      heading: "#c4b5fd",
    },
    avatars: {
      boy: [
        { key: "knight", emoji: "⚔️", name: "Caballero" },
        { key: "wizard", emoji: "🧙‍♂️", name: "Mago" },
        { key: "archer", emoji: "🏹", name: "Arquero" },
        { key: "explorer", emoji: "🗺️", name: "Explorador" },
        { key: "ninja", emoji: "🥷", name: "Ninja" },
      ],
      girl: [
        { key: "witch", emoji: "🧙‍♀️", name: "Hechicera" },
        { key: "archer", emoji: "🏹", name: "Arquera" },
        { key: "princess", emoji: "👸", name: "Princesa guerrera" },
        { key: "explorer", emoji: "🗺️", name: "Exploradora" },
        { key: "fairy", emoji: "🧚", name: "Hada" },
      ],
    },
  },
  manga: {
    key: "manga",
    name: "Manga",
    description: "Héroes de anime y shōnen",
    colors: {
      primary: "#f472b6",
      secondary: "#38bdf8",
      accent: "#fb7185",
      bgFrom: "#1a0a14",
      bgVia: "#4a0e2e",
      bgTo: "#0f172a",
      navActive: "#ec4899",
      heading: "#fbcfe8",
    },
    avatars: {
      boy: [
        { key: "shonen", emoji: "💥", name: "Shōnen" },
        { key: "samurai", emoji: "🗡️", name: "Samurái" },
        { key: "mecha", emoji: "🤖", name: "Piloto Mecha" },
        { key: "ninja", emoji: "🥷", name: "Shinobi" },
        { key: "student", emoji: "📚", name: "Estudiante" },
      ],
      girl: [
        { key: "magical-girl", emoji: "✨", name: "Chica mágica" },
        { key: "idol", emoji: "🎤", name: "Ídolo" },
        { key: "warrior", emoji: "⚔️", name: "Guerrera" },
        { key: "schoolgirl", emoji: "🎀", name: "Colegiala" },
        { key: "catgirl", emoji: "🐱", name: "Neko" },
      ],
    },
  },
  ocean: {
    key: "ocean",
    name: "Océano",
    description: "Piratas y exploradores marinos",
    colors: {
      primary: "#0ea5e9",
      secondary: "#14b8a6",
      accent: "#67e8f9",
      bgFrom: "#0c1929",
      bgVia: "#0c4a6e",
      bgTo: "#0f172a",
      navActive: "#0284c7",
      heading: "#7dd3fc",
    },
    avatars: {
      boy: [
        { key: "pirate", emoji: "🏴‍☠️", name: "Pirata" },
        { key: "captain", emoji: "⚓", name: "Capitán" },
        { key: "diver", emoji: "🤿", name: "Buzo" },
        { key: "fisher", emoji: "🎣", name: "Pescador" },
      ],
      girl: [
        { key: "pirate", emoji: "🏴‍☠️", name: "Pirata" },
        { key: "mermaid", emoji: "🧜‍♀️", name: "Sirena" },
        { key: "captain", emoji: "⚓", name: "Capitana" },
        { key: "diver", emoji: "🤿", name: "Buzo" },
      ],
    },
  },
};

export const THEME_LIST = Object.values(THEMES);

export function getTheme(key: string): ThemeConfig {
  return THEMES[key] ?? THEMES.adventure;
}

export function getAvatarEmoji(themeKey: string, gender: CharacterGender, avatarKey: string): string {
  const theme = getTheme(themeKey);
  const avatar = theme.avatars[gender]?.find((a) => a.key === avatarKey);
  if (avatar) return avatar.emoji;
  return theme.avatars[gender]?.[0]?.emoji ?? "🧙";
}

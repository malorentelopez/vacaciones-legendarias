export type CharacterGender = "boy" | "girl";

export interface ThemeRole {
  key: string;
  boy: { name: string };
  girl: { name: string };
}

export interface ThemeAvatar {
  key: string;
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
  roles: ThemeRole[];
}

/** Maps legacy avatar keys to unified role keys */
const LEGACY_ROLE_MAP: Record<string, Record<string, string>> = {
  adventure: {
    knight: "warrior",
    princess: "warrior",
    wizard: "wizard",
    witch: "wizard",
    archer: "archer",
    explorer: "explorer",
    ninja: "mystic",
    fairy: "mystic",
  },
  manga: {
    shonen: "hero",
    "magical-girl": "hero",
    samurai: "samurai",
    warrior: "samurai",
    mecha: "mecha",
    idol: "mecha",
    ninja: "shinobi",
    catgirl: "shinobi",
    student: "student",
    schoolgirl: "student",
  },
  ocean: {
    pirate: "pirate",
    captain: "captain",
    diver: "diver",
    fisher: "angler",
    mermaid: "angler",
  },
};

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
    roles: [
      { key: "warrior", boy: { name: "Caballero" }, girl: { name: "Guerrera" } },
      { key: "wizard", boy: { name: "Mago" }, girl: { name: "Hechicera" } },
      { key: "archer", boy: { name: "Arquero" }, girl: { name: "Arquera" } },
      { key: "explorer", boy: { name: "Explorador" }, girl: { name: "Exploradora" } },
      { key: "mystic", boy: { name: "Ninja" }, girl: { name: "Hada" } },
    ],
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
    roles: [
      { key: "hero", boy: { name: "Shōnen" }, girl: { name: "Chica mágica" } },
      { key: "samurai", boy: { name: "Samurái" }, girl: { name: "Guerrera" } },
      { key: "mecha", boy: { name: "Piloto Mecha" }, girl: { name: "Ídolo" } },
      { key: "shinobi", boy: { name: "Shinobi" }, girl: { name: "Neko" } },
      { key: "student", boy: { name: "Estudiante" }, girl: { name: "Colegiala" } },
    ],
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
    roles: [
      { key: "pirate", boy: { name: "Pirata" }, girl: { name: "Pirata" } },
      { key: "captain", boy: { name: "Capitán" }, girl: { name: "Capitana" } },
      { key: "diver", boy: { name: "Buzo" }, girl: { name: "Buzo" } },
      { key: "angler", boy: { name: "Pescador" }, girl: { name: "Sirena" } },
    ],
  },
};

export const THEME_LIST = Object.values(THEMES);

export function getTheme(key: string): ThemeConfig {
  return THEMES[key] ?? THEMES.adventure;
}

export function normalizeRoleKey(themeKey: string, avatarKey: string): string {
  const theme = getTheme(themeKey);
  const legacy = LEGACY_ROLE_MAP[themeKey]?.[avatarKey];
  if (legacy) return legacy;
  if (theme.roles.some((r) => r.key === avatarKey)) return avatarKey;
  return theme.roles[0]?.key ?? "warrior";
}

export function getThemeRoles(themeKey: string): ThemeRole[] {
  return getTheme(themeKey).roles;
}

export function getRoleName(themeKey: string, gender: CharacterGender, roleKey: string): string {
  const role = getTheme(themeKey).roles.find((r) => r.key === normalizeRoleKey(themeKey, roleKey));
  if (!role) return "Aventurero";
  return gender === "boy" ? role.boy.name : role.girl.name;
}

/** @deprecated Use getRoleName + CharacterPortrait instead */
export function getAvatarEmoji(themeKey: string, gender: CharacterGender, avatarKey: string): string {
  const roleKey = normalizeRoleKey(themeKey, avatarKey);
  const emojis: Record<string, Record<CharacterGender, string>> = {
    warrior: { boy: "⚔️", girl: "🛡️" },
    wizard: { boy: "🧙‍♂️", girl: "🧙‍♀️" },
    archer: { boy: "🏹", girl: "🏹" },
    explorer: { boy: "🗺️", girl: "🧭" },
    mystic: { boy: "🥷", girl: "🧚" },
    hero: { boy: "💥", girl: "✨" },
    samurai: { boy: "🗡️", girl: "⚔️" },
    mecha: { boy: "🤖", girl: "🎤" },
    shinobi: { boy: "🥷", girl: "🐱" },
    student: { boy: "📚", girl: "🎀" },
    pirate: { boy: "🏴‍☠️", girl: "🏴‍☠️" },
    captain: { boy: "⚓", girl: "⚓" },
    diver: { boy: "🤿", girl: "🤿" },
    angler: { boy: "🎣", girl: "🧜‍♀️" },
  };
  return emojis[roleKey]?.[gender] ?? "🧙";
}

/** Returns avatars list for a gender (for backward compatibility) */
export function getThemeAvatars(themeKey: string, gender: CharacterGender): ThemeAvatar[] {
  return getThemeRoles(themeKey).map((role) => ({
    key: role.key,
    name: gender === "boy" ? role.boy.name : role.girl.name,
  }));
}

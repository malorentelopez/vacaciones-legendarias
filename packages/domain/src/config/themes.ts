export type CharacterGender = "boy" | "girl";

export interface ThemeRole {
  key: string;
  boy: { name: string; image: string };
  girl: { name: string; image: string };
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

function avatarImage(theme: string, role: string, gender: CharacterGender): string {
  return `/avatars/${theme}/${role}-${gender}.png`;
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
      {
        key: "warrior",
        boy: { name: "Caballero", image: avatarImage("adventure", "warrior", "boy") },
        girl: { name: "Guerrera", image: avatarImage("adventure", "warrior", "girl") },
      },
      {
        key: "wizard",
        boy: { name: "Mago", image: avatarImage("adventure", "wizard", "boy") },
        girl: { name: "Hechicera", image: avatarImage("adventure", "wizard", "girl") },
      },
      {
        key: "archer",
        boy: { name: "Arquero", image: avatarImage("adventure", "archer", "boy") },
        girl: { name: "Arquera", image: avatarImage("adventure", "archer", "girl") },
      },
      {
        key: "explorer",
        boy: { name: "Explorador", image: avatarImage("adventure", "explorer", "boy") },
        girl: { name: "Exploradora", image: avatarImage("adventure", "explorer", "girl") },
      },
      {
        key: "mystic",
        boy: { name: "Ninja", image: avatarImage("adventure", "mystic", "boy") },
        girl: { name: "Hada", image: avatarImage("adventure", "mystic", "girl") },
      },
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
      {
        key: "hero",
        boy: { name: "Shōnen", image: avatarImage("manga", "hero", "boy") },
        girl: { name: "Chica mágica", image: avatarImage("manga", "hero", "girl") },
      },
      {
        key: "samurai",
        boy: { name: "Samurái", image: avatarImage("manga", "samurai", "boy") },
        girl: { name: "Guerrera", image: avatarImage("manga", "samurai", "girl") },
      },
      {
        key: "mecha",
        boy: { name: "Piloto Mecha", image: avatarImage("manga", "mecha", "boy") },
        girl: { name: "Ídolo", image: avatarImage("manga", "mecha", "girl") },
      },
      {
        key: "shinobi",
        boy: { name: "Shinobi", image: avatarImage("manga", "shinobi", "boy") },
        girl: { name: "Neko", image: avatarImage("manga", "shinobi", "girl") },
      },
      {
        key: "student",
        boy: { name: "Estudiante", image: avatarImage("manga", "student", "boy") },
        girl: { name: "Colegiala", image: avatarImage("manga", "student", "girl") },
      },
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
      {
        key: "pirate",
        boy: { name: "Pirata", image: avatarImage("ocean", "pirate", "boy") },
        girl: { name: "Pirata", image: avatarImage("ocean", "pirate", "girl") },
      },
      {
        key: "captain",
        boy: { name: "Capitán", image: avatarImage("ocean", "captain", "boy") },
        girl: { name: "Capitana", image: avatarImage("ocean", "captain", "girl") },
      },
      {
        key: "diver",
        boy: { name: "Buzo", image: avatarImage("ocean", "diver", "boy") },
        girl: { name: "Buzo", image: avatarImage("ocean", "diver", "girl") },
      },
      {
        key: "angler",
        boy: { name: "Pescador", image: avatarImage("ocean", "angler", "boy") },
        girl: { name: "Sirena", image: avatarImage("ocean", "angler", "girl") },
      },
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

export function getRoleImage(themeKey: string, gender: CharacterGender, roleKey: string): string {
  const role = getTheme(themeKey).roles.find((r) => r.key === normalizeRoleKey(themeKey, roleKey));
  if (!role) return avatarImage("adventure", "warrior", gender);
  return gender === "boy" ? role.boy.image : role.girl.image;
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

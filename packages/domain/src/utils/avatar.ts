import { getRoleImage, normalizeRoleKey } from "../config/themes";
import { MANGA_POWER_COMBO_SECRET, OCEAN_FISHING_SECRET } from "../config/secrets";

export interface SecretProgress {
  discoveredAt?: string;
  completedAt?: string;
  attempts?: number;
}

export interface AvatarConfig {
  base?: string;
  customImage?: string | null;
  useCustom?: boolean;
  equipped?: {
    hat?: string;
    pet?: string;
    outfit?: string;
    background?: string;
  };
  unlockedAccessories?: string[];
  secrets?: Record<string, SecretProgress>;
  dialoguesSeen?: Record<string, boolean>;
  streak?: StreakProgress;
  combos?: ComboProgress;
}

export interface StreakProgress {
  current: number;
  lastActiveDate: string;
  best: number;
  milestonesAwarded?: number[];
}

export interface ComboProgress {
  morningBonusDate?: string;
}

export function parseAvatarConfig(config: unknown): AvatarConfig {
  if (!config || typeof config !== "object") return {};
  const c = config as Record<string, unknown>;

  const equipped =
    c.equipped && typeof c.equipped === "object"
      ? (c.equipped as AvatarConfig["equipped"])
      : undefined;

  const secrets: Record<string, SecretProgress> = {};
  if (c.secrets && typeof c.secrets === "object") {
    for (const [key, value] of Object.entries(c.secrets as Record<string, unknown>)) {
      if (!value || typeof value !== "object") continue;
      const entry = value as Record<string, unknown>;
      secrets[key] = {
        discoveredAt: typeof entry.discoveredAt === "string" ? entry.discoveredAt : undefined,
        completedAt: typeof entry.completedAt === "string" ? entry.completedAt : undefined,
        attempts: typeof entry.attempts === "number" ? entry.attempts : undefined,
      };
    }
  }

  const dialoguesSeen: Record<string, boolean> = {};
  if (c.dialoguesSeen && typeof c.dialoguesSeen === "object") {
    for (const [key, value] of Object.entries(c.dialoguesSeen as Record<string, unknown>)) {
      if (value === true) dialoguesSeen[key] = true;
    }
  }

  let streak: StreakProgress | undefined;
  if (c.streak && typeof c.streak === "object") {
    const entry = c.streak as Record<string, unknown>;
    const current = typeof entry.current === "number" ? entry.current : 0;
    const lastActiveDate = typeof entry.lastActiveDate === "string" ? entry.lastActiveDate : "";
    const best = typeof entry.best === "number" ? entry.best : 0;
    const milestonesAwarded = Array.isArray(entry.milestonesAwarded)
      ? entry.milestonesAwarded.filter((item): item is number => typeof item === "number")
      : undefined;
    if (lastActiveDate) {
      streak = { current, lastActiveDate, best, milestonesAwarded };
    }
  }

  let combos: ComboProgress | undefined;
  if (c.combos && typeof c.combos === "object") {
    const entry = c.combos as Record<string, unknown>;
    combos = {
      morningBonusDate:
        typeof entry.morningBonusDate === "string" ? entry.morningBonusDate : undefined,
    };
  }

  return {
    base: typeof c.base === "string" ? c.base : undefined,
    customImage: typeof c.customImage === "string" ? c.customImage : null,
    useCustom: c.useCustom === true,
    equipped,
    unlockedAccessories: Array.isArray(c.unlockedAccessories)
      ? c.unlockedAccessories.filter((item): item is string => typeof item === "string")
      : undefined,
    secrets: Object.keys(secrets).length > 0 ? secrets : undefined,
    dialoguesSeen: Object.keys(dialoguesSeen).length > 0 ? dialoguesSeen : undefined,
    streak,
    combos,
  };
}

export function getSecretProgress(config: unknown, secretKey: string): SecretProgress | undefined {
  return parseAvatarConfig(config).secrets?.[secretKey];
}

export function mergeAvatarConfig(current: unknown, patch: Partial<AvatarConfig>): AvatarConfig {
  const parsed = parseAvatarConfig(current);
  return {
    ...parsed,
    ...patch,
    equipped: { ...parsed.equipped, ...patch.equipped },
    unlockedAccessories: patch.unlockedAccessories ?? parsed.unlockedAccessories,
    secrets: { ...parsed.secrets, ...patch.secrets },
    dialoguesSeen: { ...parsed.dialoguesSeen, ...patch.dialoguesSeen },
    streak: patch.streak ?? parsed.streak,
    combos: { ...parsed.combos, ...patch.combos },
  };
}

export function getUnlockedAccessoryKeys(
  config: unknown,
  options: { level: number; secretCompleted?: boolean; streakCurrent?: number }
): string[] {
  const parsed = parseAvatarConfig(config);
  const unlocked = new Set<string>(["default", ...(parsed.unlockedAccessories ?? [])]);

  if (options.level >= 3) unlocked.add("hat_star");
  if (options.level >= 5 || (options.streakCurrent ?? parsed.streak?.current ?? 0) >= 7) {
    unlocked.add("pet_cat");
  }
  if (options.secretCompleted) unlocked.add("hat_dragon");
  const secrets = parsed.secrets;
  if (secrets?.[MANGA_POWER_COMBO_SECRET.key]?.completedAt) unlocked.add("bandana_hero");
  if (secrets?.[OCEAN_FISHING_SECRET.key]?.completedAt) unlocked.add("pet_fish");

  return [...unlocked];
}

export function getEquippedHatEmoji(config: unknown): string | null {
  const hat = parseAvatarConfig(config).equipped?.hat;
  if (!hat || hat === "default") return null;
  if (hat === "hat_dragon") return "🐉";
  if (hat === "hat_star") return "⭐";
  if (hat === "bandana_hero") return "🥷";
  return "🎩";
}

const PET_EMOJI: Record<string, string> = {
  pet_cat: "🐱",
  pet_fish: "🐟",
};

export function getUnlockedPetKeys(
  config: unknown,
  options: { level: number; secretCompleted?: boolean; streakCurrent?: number }
): string[] {
  return getUnlockedAccessoryKeys(config, options).filter((key) => key.startsWith("pet_"));
}

export function getEquippedPetEmoji(config: unknown): string | null {
  const pet = parseAvatarConfig(config).equipped?.pet;
  if (!pet || pet === "default") return null;
  return PET_EMOJI[pet] ?? "🐾";
}

export function getCharacterPortraitSrc(character: {
  themeKey: string;
  gender: "BOY" | "GIRL";
  avatarBase: string;
  avatarConfig?: unknown;
}): string {
  const config = parseAvatarConfig(character.avatarConfig);
  if (config.useCustom && config.customImage) {
    return config.customImage;
  }
  const genderKey = character.gender === "BOY" ? "boy" : "girl";
  const roleKey = normalizeRoleKey(character.themeKey, character.avatarBase);
  return getRoleImage(character.themeKey, genderKey, roleKey);
}

export function hasCustomAvatar(character: { avatarConfig?: unknown }): boolean {
  const config = parseAvatarConfig(character.avatarConfig);
  return config.useCustom === true && !!config.customImage;
}

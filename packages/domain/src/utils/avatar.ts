import { getRoleImage, normalizeRoleKey } from "../config/themes";

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
  };
}

export function getUnlockedAccessoryKeys(
  config: unknown,
  options: { level: number; secretCompleted?: boolean }
): string[] {
  const parsed = parseAvatarConfig(config);
  const unlocked = new Set<string>(["default", ...(parsed.unlockedAccessories ?? [])]);

  if (options.level >= 3) unlocked.add("hat_star");
  if (options.level >= 5) unlocked.add("pet_cat");
  if (options.secretCompleted) unlocked.add("hat_dragon");

  return [...unlocked];
}

export function getEquippedHatEmoji(config: unknown): string | null {
  const hat = parseAvatarConfig(config).equipped?.hat;
  if (!hat || hat === "default") return null;
  if (hat === "hat_dragon") return "🐉";
  if (hat === "hat_star") return "⭐";
  return "🎩";
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

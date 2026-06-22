import { getRoleImage, normalizeRoleKey } from "../config/themes";

export interface AvatarConfig {
  base?: string;
  customImage?: string | null;
  useCustom?: boolean;
}

export function parseAvatarConfig(config: unknown): AvatarConfig {
  if (!config || typeof config !== "object") return {};
  const c = config as Record<string, unknown>;
  return {
    base: typeof c.base === "string" ? c.base : undefined,
    customImage: typeof c.customImage === "string" ? c.customImage : null,
    useCustom: c.useCustom === true,
  };
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

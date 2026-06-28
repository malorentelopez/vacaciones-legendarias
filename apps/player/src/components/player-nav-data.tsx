import { getCharacter } from "@/actions/game";
import { getMangaPowerComboStatus, getOceanFishingStatus } from "@/actions/secrets";
import { PlayerNav } from "@/components/player-nav";
import { ThemeSync } from "@/components/theme-sync";
import {
  getCharacterPortraitSrc,
  getRoleName,
  normalizeRoleKey,
  parseAvatarConfig,
  getEquippedPetEmoji,
} from "@repo/domain";
import type { HeroHudData } from "@/components/hero-hud";

export async function PlayerNavData() {
  const character = await getCharacter();
  const themeKey = character.themeKey;
  const crystals = character.crystals;
  const petEmoji = getEquippedPetEmoji(character.avatarConfig);
  const genderKey = character.gender === "BOY" ? "boy" : "girl";

  const [mangaPowerCombo, oceanFishingStatus] = await Promise.all([
    character.themeKey === "manga"
      ? getMangaPowerComboStatus().catch(() => null)
      : Promise.resolve(null),
    character.themeKey === "ocean"
      ? getOceanFishingStatus().catch(() => null)
      : Promise.resolve(null),
  ]);

  const oceanFishing = oceanFishingStatus
    ? {
        eligible: oceanFishingStatus.eligible,
        discovered: oceanFishingStatus.discovered,
        completed: oceanFishingStatus.completed,
      }
    : undefined;

  const hero: HeroHudData = {
    name: character.name,
    roleName: getRoleName(
      character.themeKey,
      genderKey,
      normalizeRoleKey(character.themeKey, character.avatarBase)
    ),
    level: character.level,
    crystals: character.crystals,
    portraitSrc: getCharacterPortraitSrc(character),
    xpProgress: character.xpProgress.progress,
    streak: parseAvatarConfig(character.avatarConfig).streak?.current ?? 0,
    petEmoji,
    themeKey: character.themeKey,
    mangaPowerCombo: mangaPowerCombo
      ? {
          eligible: mangaPowerCombo.eligible,
          discovered: mangaPowerCombo.discovered,
          completed: mangaPowerCombo.completed,
        }
      : undefined,
  };

  return (
    <>
      <ThemeSync themeKey={themeKey} />
      <PlayerNav crystals={crystals} hero={hero} themeKey={themeKey} oceanFishing={oceanFishing} />
    </>
  );
}

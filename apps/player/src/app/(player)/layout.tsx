import { getValidPlayerSession } from "@/lib/player-session";
import { getCharacter } from "@/actions/game";
import {
  getDragonChestStatus,
  getMangaPowerComboStatus,
  getOceanFishingStatus,
} from "@/actions/secrets";
import { cn, mobileMainBottomClass } from "@repo/ui";
import { PlayerNav } from "@/components/player-nav";
import { PlayerPageTransition } from "@/components/player-page-transition";
import { PlayerThemeShell } from "@/components/theme-provider";
import {
  getCharacterPortraitSrc,
  getRoleName,
  normalizeRoleKey,
  parseAvatarConfig,
  getEquippedPetEmoji,
} from "@repo/domain";
import type { HeroHudData } from "@/components/hero-hud";

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  const session = await getValidPlayerSession();
  let themeKey = "adventure";
  let crystals = 0;
  let hero: HeroHudData | undefined;

  let petEmoji: string | null = null;
  let oceanFishing:
    | { eligible: boolean; discovered: boolean; completed: boolean }
    | undefined;

  if (session?.characterId) {
    try {
      const character = await getCharacter();
      themeKey = character.themeKey;
      crystals = character.crystals;
      petEmoji = getEquippedPetEmoji(character.avatarConfig);
      const genderKey = character.gender === "BOY" ? "boy" : "girl";

      const [mangaPowerCombo, oceanFishingStatus] = await Promise.all([
        character.themeKey === "manga"
          ? getMangaPowerComboStatus().catch(() => null)
          : Promise.resolve(null),
        character.themeKey === "ocean"
          ? getOceanFishingStatus().catch(() => null)
          : Promise.resolve(null),
      ]);

      if (oceanFishingStatus) {
        oceanFishing = {
          eligible: oceanFishingStatus.eligible,
          discovered: oceanFishingStatus.discovered,
          completed: oceanFishingStatus.completed,
        };
      }

      hero = {
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
    } catch {
      // Personaje no disponible; el layout mostrará el selector sin nav.
    }
  }

  if (!session?.characterId) {
    return (
      <PlayerThemeShell initialThemeKey="adventure">
        <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
      </PlayerThemeShell>
    );
  }

  return (
    <PlayerThemeShell initialThemeKey={themeKey} petEmoji={petEmoji}>
      <PlayerNav crystals={crystals} hero={hero} themeKey={themeKey} oceanFishing={oceanFishing} />
      <PlayerPageTransition>
        <main className={cn("mx-auto max-w-4xl px-4 py-6", mobileMainBottomClass)}>{children}</main>
      </PlayerPageTransition>
    </PlayerThemeShell>
  );
}

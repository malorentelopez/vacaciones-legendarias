import { getValidPlayerSession } from "@/lib/player-session";
import { getCharacter } from "@/actions/game";
import { PlayerNav } from "@/components/player-nav";
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

  if (session?.characterId) {
    try {
      const character = await getCharacter();
      themeKey = character.themeKey;
      crystals = character.crystals;
      petEmoji = getEquippedPetEmoji(character.avatarConfig);
      const genderKey = character.gender === "BOY" ? "boy" : "girl";
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
      <PlayerNav crystals={crystals} hero={hero} />
      <main className="mx-auto max-w-4xl px-4 py-6 pb-24 md:pb-6">{children}</main>
    </PlayerThemeShell>
  );
}

import { getValidPlayerSession } from "@/lib/player-session";
import { getCharacter } from "@/actions/game";
import { PlayerNav } from "@/components/player-nav";
import { PlayerThemeShell } from "@/components/theme-provider";

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  const session = await getValidPlayerSession();
  let themeKey = "adventure";

  if (session?.characterId) {
    try {
      const character = await getCharacter();
      themeKey = character.themeKey;
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
    <PlayerThemeShell initialThemeKey={themeKey}>
      <PlayerNav />
      <main className="mx-auto max-w-4xl px-4 py-6 pb-24 md:pb-6">{children}</main>
    </PlayerThemeShell>
  );
}

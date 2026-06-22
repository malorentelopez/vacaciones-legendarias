import { getValidPlayerSession } from "@/lib/player-session";
import { getCharacter } from "@/actions/game";
import { PlayerNav } from "@/components/player-nav";
import { ThemeProvider } from "@/components/theme-provider";

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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-violet-950/20 to-slate-900">
        <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
      </div>
    );
  }

  return (
    <ThemeProvider themeKey={themeKey}>
      <PlayerNav />
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </ThemeProvider>
  );
}

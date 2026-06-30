import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getValidPlayerSession } from "@/lib/player-session";
import { getCharacter } from "@/actions/game";
import { cn, mobileMainBottomClass } from "@repo/ui";
import { PlayerNavData } from "@/components/player-nav-data";
import { PlayerNavSkeleton } from "@/components/player-nav-skeleton";
import { PlayerNavigationProvider } from "@/components/player-navigation";
import { PlayerPageTransition } from "@/components/player-page-transition";
import { PlayerThemeShell } from "@/components/theme-provider";

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  const session = await getValidPlayerSession();
  if (!session || session.role !== "CHILD") redirect("/login");

  const initialThemeKey = session.characterId
    ? (await getCharacter()).themeKey
    : "adventure";

  if (!session.characterId) {
    return (
      <PlayerThemeShell initialThemeKey={initialThemeKey}>
        <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
      </PlayerThemeShell>
    );
  }

  return (
    <PlayerThemeShell initialThemeKey={initialThemeKey}>
      <PlayerNavigationProvider>
        <Suspense fallback={<PlayerNavSkeleton />}>
          <PlayerNavData />
        </Suspense>
        <PlayerPageTransition>
          <main className={cn("mx-auto max-w-4xl px-4 py-6", mobileMainBottomClass)}>{children}</main>
        </PlayerPageTransition>
      </PlayerNavigationProvider>
    </PlayerThemeShell>
  );
}

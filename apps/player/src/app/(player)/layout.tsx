import { getSession } from "@/lib/auth";
import { PlayerNav } from "@/components/player-nav";

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-violet-950/20 to-slate-900">
      {session?.characterId && <PlayerNav />}
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}

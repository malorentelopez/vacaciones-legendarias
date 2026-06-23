"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@repo/ui";
import { completeBossObjective } from "@/actions/game";
import { useCelebrations } from "@/components/celebration-provider";
import { MangaActionButton } from "@/components/manga/manga-action-button";
import { MangaPanel } from "@/components/manga/manga-panel";
import { BossHpBar } from "@/components/manga/boss-hp-bar";
import { BossStrikeFx } from "@/components/manga/boss-strike-fx";
import { MANGA_COPY } from "@/lib/manga-copy";
import { Swords, CheckCircle2 } from "lucide-react";

interface BossObjective {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  targetDate: Date | null;
}

interface BossBattle {
  id: string;
  title: string;
  description: string | null;
  month: number;
  year: number;
  xpReward: number;
  crystalReward: number;
  objectives: BossObjective[];
}

const MONTHS = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export function BossBattlesView({ bosses }: { bosses: BossBattle[] }) {
  const router = useRouter();
  const { applyGameFeedback } = useCelebrations();
  const [loading, setLoading] = useState<string | null>(null);
  const [strikeFx, setStrikeFx] = useState<{ bossId: string; ko: boolean } | null>(null);

  async function handleComplete(objectiveId: string, boss: BossBattle) {
    setLoading(objectiveId);
    try {
      const result = await completeBossObjective(objectiveId);
      const completedBefore = boss.objectives.filter((item) => item.completed).length;
      const willCompleteBoss = completedBefore + 1 >= boss.objectives.length;

      setStrikeFx({ bossId: boss.id, ko: willCompleteBoss && result.bossCompleted });

      applyGameFeedback({
        bossVictory: result.bossCompleted && result.boss
          ? {
              title: result.boss.title,
              xpReward: result.boss.xpReward,
              crystalReward: result.boss.crystalReward,
            }
          : null,
        levelUp: result.levelUp,
      });
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
    setLoading(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="theme-eyebrow">Combate épico</p>
        <h1 className="theme-page-title font-display tracking-wide">{MANGA_COPY.bossBattlesTitle}</h1>
      </div>

      {bosses.map((boss) => {
        const completedObjectives = boss.objectives.filter((item) => item.completed).length;
        const totalObjectives = boss.objectives.length;
        const bossDefeated = totalObjectives > 0 && completedObjectives === totalObjectives;

        return (
          <MangaPanel key={boss.id} variant="boss" className="relative overflow-hidden">
            {strikeFx?.bossId === boss.id && (
              <BossStrikeFx
                ko={strikeFx.ko}
                onComplete={() => setStrikeFx(null)}
              />
            )}
            <Card className="border-0 bg-transparent shadow-none">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="boss-icon-badge flex h-14 w-14 items-center justify-center text-3xl">
                    🐉
                  </div>
                  <div>
                    <CardTitle className="font-display tracking-wide">{boss.title}</CardTitle>
                    <p className="text-sm text-slate-400">
                      {MONTHS[boss.month]} {boss.year}
                    </p>
                  </div>
                  {bossDefeated && (
                    <Badge variant="success" className="ml-auto font-display uppercase tracking-wide">
                      Clear!
                    </Badge>
                  )}
                </div>
                {boss.description && <p className="text-slate-300">{boss.description}</p>}
                <BossHpBar
                  completedObjectives={completedObjectives}
                  totalObjectives={totalObjectives}
                />
                <div className="flex gap-2">
                  <Badge variant="info">+{boss.xpReward} XP</Badge>
                  <Badge variant="warning">+{boss.crystalReward} 💎</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {boss.objectives.map((obj) => (
                  <div
                    key={obj.id}
                    className={`flex items-center justify-between rounded-xl border p-3 ${
                      obj.completed
                        ? "border-emerald-500/30 bg-emerald-900/20"
                        : "border-red-500/15 bg-slate-900/60"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {obj.completed ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                      ) : (
                        <Swords className="h-5 w-5 shrink-0 text-red-400" />
                      )}
                      <div className="min-w-0">
                        <span className={obj.completed ? "line-through text-slate-400" : "text-slate-100"}>
                          {obj.title}
                        </span>
                        {obj.description && (
                          <p className="text-xs text-slate-500">{obj.description}</p>
                        )}
                      </div>
                    </div>
                    {!obj.completed && (
                      <MangaActionButton
                        size="sm"
                        onClick={() => handleComplete(obj.id, boss)}
                        disabled={loading === obj.id}
                      >
                        {loading === obj.id ? "..." : MANGA_COPY.bossStrike}
                      </MangaActionButton>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </MangaPanel>
        );
      })}

      {bosses.length === 0 && (
        <Card className="manga-panel p-8 text-center text-slate-400">
          <p className="font-display text-2xl text-red-200">El dragón descansa</p>
          <p className="mt-2 text-sm">Vuelve más tarde para un nuevo reto del verano.</p>
        </Card>
      )}
    </div>
  );
}

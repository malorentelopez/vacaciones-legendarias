"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@repo/ui";
import { completeBossObjective } from "@/actions/game";
import { useCelebrations } from "@/components/celebration-provider";
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

  async function handleComplete(objectiveId: string) {
    setLoading(objectiveId);
    try {
      const result = await completeBossObjective(objectiveId);
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
      <h1 className="theme-page-title">Boss Battles</h1>
      {bosses.map((boss) => (
        <Card key={boss.id} className="border-red-500/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Swords className="h-8 w-8 text-red-400" />
              <div>
                <CardTitle>{boss.title}</CardTitle>
                <p className="text-sm text-slate-400">
                  {MONTHS[boss.month]} {boss.year}
                </p>
              </div>
            </div>
            {boss.description && <p className="text-slate-400">{boss.description}</p>}
            <div className="flex gap-2">
              <Badge variant="info">+{boss.xpReward} XP</Badge>
              <Badge variant="warning">+{boss.crystalReward} 💎</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {boss.objectives.map((obj) => (
              <div
                key={obj.id}
                className={`flex items-center justify-between rounded-xl p-3 ${
                  obj.completed ? "bg-emerald-900/20" : "bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {obj.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Swords className="h-5 w-5 text-slate-500" />
                  )}
                  <span className={obj.completed ? "line-through text-slate-400" : ""}>
                    {obj.title}
                  </span>
                </div>
                {!obj.completed && (
                  <Button size="sm" onClick={() => handleComplete(obj.id)} disabled={loading === obj.id}>
                    {loading === obj.id ? "..." : "Completar"}
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      {bosses.length === 0 && (
        <p className="text-center text-slate-400">No hay boss battles activos</p>
      )}
    </div>
  );
}

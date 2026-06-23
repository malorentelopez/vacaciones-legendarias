"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@repo/ui";
import { purchaseReward } from "@/actions/game";
import { MangaActionButton } from "@/components/manga/manga-action-button";
import { MANGA_COPY } from "@/lib/manga-copy";
import { Gift, CheckCircle2 } from "lucide-react";

interface Reward {
  id: string;
  title: string;
  description: string | null;
  crystalCost: number;
  maxPurchases: number | null;
  requiredLevel: number | null;
  isExhausted: boolean;
  isLevelLocked: boolean;
}

export function StoreView({
  rewards,
  crystals,
  level,
}: {
  rewards: Reward[];
  crystals: number;
  level: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [items, setItems] = useState(rewards);

  useEffect(() => {
    setItems(rewards);
  }, [rewards]);

  async function handlePurchase(rewardId: string, cost: number) {
    const reward = items.find((item) => item.id === rewardId);
    if (!reward || reward.isExhausted || reward.isLevelLocked) return;

    if (crystals < cost) {
      alert("No tienes suficientes cristales");
      return;
    }

    setLoading(rewardId);
    try {
      await purchaseReward(rewardId);
      if (reward.maxPurchases === 1) {
        setItems((current) =>
          current.map((item) =>
            item.id === rewardId ? { ...item, isExhausted: true } : item
          )
        );
      }
      router.refresh();
      alert("¡Compra solicitada! Espera la aprobación de tus padres.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
    setLoading(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="theme-page-title font-display tracking-wide">Mercader del verano</h1>
        <Badge variant="warning" className="text-base px-4 py-1">
          💎 {crystals} cristales
        </Badge>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((reward) => {
          const canAfford = crystals >= reward.crystalCost;
          const isDisabled =
            reward.isExhausted || reward.isLevelLocked || !canAfford || loading === reward.id;

          return (
            <Card
              key={reward.id}
              className={`manga-panel manga-panel-quest bg-slate-900/80 ${reward.isExhausted || reward.isLevelLocked ? "opacity-60" : ""}`}
            >
              <CardHeader className="flex-row items-center gap-3">
                <div className="theme-surface-strong rounded-xl p-3">
                  <Gift className="theme-icon h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">{reward.title}</CardTitle>
                  {reward.description && (
                    <p className="text-sm text-slate-400">{reward.description}</p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="warning">💎 {reward.crystalCost}</Badge>
                  {reward.requiredLevel != null && (
                    <Badge variant={reward.isLevelLocked ? "default" : "info"}>
                      Nivel {reward.requiredLevel}
                    </Badge>
                  )}
                  {reward.maxPurchases === 1 && !reward.isExhausted && (
                    <Badge variant="info">Solo una vez</Badge>
                  )}
                </div>
                {reward.isExhausted ? (
                  <span className="inline-flex items-center gap-1 text-sm text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Ya canjeada
                  </span>
                ) : reward.isLevelLocked ? (
                  <span className="text-sm text-slate-400">
                    Nivel {level}/{reward.requiredLevel}
                  </span>
                ) : (
                  <MangaActionButton
                    size="sm"
                    onClick={() => handlePurchase(reward.id, reward.crystalCost)}
                    disabled={isDisabled}
                  >
                    {loading === reward.id ? "..." : MANGA_COPY.redeemTreasure}
                  </MangaActionButton>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {items.length === 0 && (
        <p className="text-center text-slate-400">La tienda está vacía</p>
      )}
    </div>
  );
}

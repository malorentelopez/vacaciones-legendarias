"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, Badge } from "@repo/ui";
import { purchaseReward } from "@/actions/game";
import { MangaActionButton } from "@/components/manga/manga-action-button";
import { StorePurchaseFx } from "@/components/store-purchase-fx";
import { MANGA_COPY } from "@/lib/manga-copy";
import { getRewardEmoji } from "@/lib/reward-display";
import { CheckCircle2, Store } from "lucide-react";

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
  const [purchaseFxId, setPurchaseFxId] = useState<string | null>(null);
  const [purchaseNote, setPurchaseNote] = useState(false);

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
      setPurchaseFxId(rewardId);
      setPurchaseNote(true);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
    setLoading(null);
  }

  return (
    <div className="space-y-6">
      <Card className="merchant-hero manga-panel manga-panel-quest overflow-hidden">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="merchant-hero-icon theme-surface-strong flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl">
              🏪
            </div>
            <div>
              <div className="theme-eyebrow mb-1 flex items-center gap-2">
                <Store className="h-4 w-4" />
                <span>Puesto del mercader</span>
              </div>
              <h1 className="theme-page-title font-display tracking-wide">{MANGA_COPY.merchantTitle}</h1>
              <p className="mt-1 text-sm italic text-slate-300">“{MANGA_COPY.merchantTagline}”</p>
            </div>
          </div>
          <Badge variant="warning" className="self-start px-4 py-2 text-base sm:self-center">
            💎 {crystals} cristales
          </Badge>
        </CardContent>
      </Card>

      {purchaseNote && (
        <Card className="manga-panel border-emerald-500/40 bg-emerald-950/30 p-4 text-sm text-emerald-100">
          {MANGA_COPY.merchantPurchaseNote}
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((reward) => {
          const canAfford = crystals >= reward.crystalCost;
          const isDisabled =
            reward.isExhausted || reward.isLevelLocked || !canAfford || loading === reward.id;
          const emoji = getRewardEmoji(reward.title);

          return (
            <Card
              key={reward.id}
              className={`merchant-vitrine manga-panel manga-panel-quest relative overflow-hidden bg-slate-900/80 ${
                reward.isExhausted || reward.isLevelLocked ? "opacity-60" : ""
              }`}
            >
              {purchaseFxId === reward.id && (
                <StorePurchaseFx onComplete={() => setPurchaseFxId(null)} />
              )}
              <CardContent className="space-y-4 p-5">
                <div className="merchant-vitrine-display flex flex-col items-center gap-2 py-2 text-center">
                  <span className="merchant-vitrine-emoji text-5xl" aria-hidden>
                    {emoji}
                  </span>
                  <h2 className="font-display text-xl tracking-wide text-white">{reward.title}</h2>
                  {reward.description && (
                    <p className="text-sm text-slate-400">{reward.description}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
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

                <div className="flex justify-center">
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
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {items.length === 0 && (
        <Card className="manga-panel p-8 text-center text-slate-400">
          <p className="font-display text-2xl text-amber-200">El mercader está descansando</p>
          <p className="mt-2 text-sm">Vuelve más tarde para ver nuevos tesoros.</p>
        </Card>
      )}
    </div>
  );
}

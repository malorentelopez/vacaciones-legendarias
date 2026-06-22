"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@repo/ui";
import { purchaseReward } from "@/actions/game";
import { Gift } from "lucide-react";

interface Reward {
  id: string;
  title: string;
  description: string | null;
  crystalCost: number;
}

export function StoreView({ rewards, crystals }: { rewards: Reward[]; crystals: number }) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handlePurchase(rewardId: string, cost: number) {
    if (crystals < cost) {
      alert("No tienes suficientes cristales");
      return;
    }
    setLoading(rewardId);
    try {
      await purchaseReward(rewardId);
      alert("¡Compra solicitada! Espera la aprobación de tus padres.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
    setLoading(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-violet-300">Cofre del tesoro</h1>
        <Badge variant="warning" className="text-base px-4 py-1">
          💎 {crystals} cristales
        </Badge>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {rewards.map((reward) => (
          <Card key={reward.id}>
            <CardHeader className="flex-row items-center gap-3">
              <div className="rounded-xl bg-violet-500/20 p-3">
                <Gift className="h-6 w-6 text-violet-400" />
              </div>
              <div>
                <CardTitle className="text-lg">{reward.title}</CardTitle>
                {reward.description && (
                  <p className="text-sm text-slate-400">{reward.description}</p>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <Badge variant="warning">💎 {reward.crystalCost}</Badge>
              <Button
                size="sm"
                onClick={() => handlePurchase(reward.id, reward.crystalCost)}
                disabled={loading === reward.id || crystals < reward.crystalCost}
              >
                {loading === reward.id ? "..." : "Comprar"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {rewards.length === 0 && (
        <p className="text-center text-slate-400">La tienda está vacía</p>
      )}
    </div>
  );
}

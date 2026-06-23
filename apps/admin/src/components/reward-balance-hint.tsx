"use client";

import { useEffect, useState } from "react";
import { getRewardBalancePreview } from "@/actions/admin";
import { TIER_LABELS, formatWeeksLabel } from "@repo/domain/client";
import { AlertTriangle, TrendingUp } from "lucide-react";

export function RewardBalanceHint({
  crystalCost,
  maxPurchases,
}: {
  crystalCost: number;
  maxPurchases: number | null;
}) {
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof getRewardBalancePreview>> | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (crystalCost <= 0) {
      setPreview(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getRewardBalancePreview(crystalCost, maxPurchases).then((result) => {
      if (!cancelled) {
        setPreview(result);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [crystalCost, maxPurchases]);

  if (crystalCost <= 0) return null;

  return (
    <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-300">
        <TrendingUp className="h-4 w-4" />
        Proyección de balance
      </div>

      {loading && !preview ? (
        <p className="text-sm text-slate-400">Calculando...</p>
      ) : preview ? (
        <div className="space-y-2 text-sm">
          <p>
            Con progreso <strong>normal</strong>:{" "}
            <span className="text-cyan-400">{formatWeeksLabel(preview.weeksToAfford.normal)}</span>
            {" · "}
            <span className="text-slate-400">{TIER_LABELS[preview.tier]}</span>
          </p>
          <p className="text-slate-400">
            Rango: {formatWeeksLabel(preview.weeksToAfford.conservative)} –{" "}
            {formatWeeksLabel(preview.weeksToAfford.optimistic)}
          </p>
          {preview.historicalWeeks != null && (
            <p className="text-slate-400">
              Según datos reales: {formatWeeksLabel(preview.historicalWeeks)}
            </p>
          )}
          {preview.warnings.length > 0 && (
            <div className="space-y-1 pt-1">
              {preview.warnings.map((warning) => (
                <p key={warning} className="flex items-start gap-1.5 text-amber-400">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {warning}
                </p>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

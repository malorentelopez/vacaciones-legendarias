"use client";

import { Card, Badge } from "@repo/ui";
import {
  TIER_LABELS,
  formatWeeksLabel,
  type EconomyProjection,
  type ProgressScenario,
  type RewardTier,
} from "@repo/domain/client";
import { Gem, TrendingUp, AlertTriangle } from "lucide-react";

const SCENARIO_LABELS: Record<ProgressScenario, string> = {
  optimistic: "Optimista",
  normal: "Normal",
  conservative: "Conservador",
};

const TIER_VARIANTS: Record<RewardTier, "success" | "info" | "warning" | "default"> = {
  impulse: "success",
  medium: "info",
  major: "warning",
  epic: "default",
};

function IncomeBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-medium">
          {value} <span className="text-slate-500">({percent}%)</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function EconomyDashboard({ projection }: { projection: EconomyProjection }) {
  const normal = projection.scenarios.normal.weeklyIncome;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Balance de economía</h1>
        <p className="mt-1 text-slate-400">
          Proyección de ingresos y tiempo estimado para alcanzar cada recompensa.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {(Object.keys(SCENARIO_LABELS) as ProgressScenario[]).map((scenario) => {
          const income = projection.scenarios[scenario].weeklyIncome;
          return (
            <Card key={scenario} className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">{SCENARIO_LABELS[scenario]}</h2>
                {scenario === "normal" && <Badge variant="info">Referencia</Badge>}
              </div>
              <p className="text-3xl font-bold text-cyan-400">
                {income.total}
                <span className="ml-1 text-base font-normal text-slate-400">💎/sem</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">
                ~{Math.round(income.total * (30 / 7))} cristales/mes
              </p>
            </Card>
          );
        })}
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-violet-400" />
          <h2 className="text-lg font-semibold">Desglose de ingresos (progreso normal)</h2>
        </div>
        <div className="space-y-3">
          <IncomeBar label="Misiones" value={normal.missions} total={normal.total} color="bg-emerald-500" />
          <IncomeBar label="Subidas de nivel" value={normal.levels} total={normal.total} color="bg-violet-500" />
          <IncomeBar label="Logros" value={normal.achievements} total={normal.total} color="bg-amber-500" />
          <IncomeBar label="Retos del mes" value={normal.boss} total={normal.total} color="bg-rose-500" />
        </div>
      </Card>

      {projection.historical && (
        <Card className="border-cyan-500/30 p-5">
          <div className="mb-2 flex items-center gap-2">
            <Gem className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-semibold">Datos reales (últimas {projection.historical.weeksOfData} semanas)</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-400">Ingreso semanal medio</p>
              <p className="text-2xl font-bold text-cyan-400">
                {projection.historical.avgWeeklyEarned} 💎
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Gasto semanal medio</p>
              <p className="text-2xl font-bold text-amber-400">
                {projection.historical.avgWeeklySpent} 💎
              </p>
            </div>
          </div>
        </Card>
      )}

      <div>
        <h2 className="mb-4 text-xl font-bold">Recompensas de la tienda</h2>
        {projection.rewards.length === 0 ? (
          <Card className="p-8 text-center text-slate-400">
            No hay recompensas configuradas. Crea algunas en la sección de Recompensas.
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Recompensa</th>
                  <th className="px-4 py-3 font-medium">Coste</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Tiempo (normal)</th>
                  <th className="px-4 py-3 font-medium">Rango</th>
                  <th className="px-4 py-3 font-medium">Alertas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {projection.rewards.map((reward) => (
                  <tr key={reward.id} className="bg-slate-900/40">
                    <td className="px-4 py-3 font-medium">
                      {reward.title}
                      {reward.maxPurchases === 1 && (
                        <span className="ml-2 text-xs text-violet-400">única</span>
                      )}
                    </td>
                    <td className="px-4 py-3">💎 {reward.crystalCost}</td>
                    <td className="px-4 py-3">
                      <Badge variant={TIER_VARIANTS[reward.tier]}>{TIER_LABELS[reward.tier]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {formatWeeksLabel(reward.weeksToAfford.normal)}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {formatWeeksLabel(reward.weeksToAfford.conservative)} –{" "}
                      {formatWeeksLabel(reward.weeksToAfford.optimistic)}
                    </td>
                    <td className="px-4 py-3">
                      {reward.warnings.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {reward.warnings.map((warning) => (
                            <span
                              key={warning}
                              className="inline-flex items-center gap-1 text-xs text-amber-400"
                            >
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              {warning}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

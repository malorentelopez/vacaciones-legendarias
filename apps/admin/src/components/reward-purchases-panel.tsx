"use client";

import { useMemo, useState } from "react";
import { Card, Badge, Button } from "@repo/ui";
import { updatePurchaseStatus } from "@/actions/admin";
import type { RewardStatus } from "@repo/database";
import { Check, X, PackageCheck, Clock, ShoppingBag } from "lucide-react";

export interface RewardPurchaseRow {
  id: string;
  status: RewardStatus;
  purchasedAt: Date;
  approvedAt: Date | null;
  deliveredAt: Date | null;
  reward: { title: string; crystalCost: number; description: string | null };
  character: { name: string };
}

type PurchaseFilter = "all" | "pending" | "approved" | "delivered" | "rejected";

const FILTER_LABELS: Record<PurchaseFilter, string> = {
  all: "Todas",
  pending: "Pendientes",
  approved: "Por entregar",
  delivered: "Entregadas",
  rejected: "Rechazadas",
};

const STATUS_LABELS: Record<RewardStatus, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  DELIVERED: "Entregada",
  REJECTED: "Rechazada",
};

const STATUS_VARIANTS: Record<RewardStatus, "warning" | "info" | "success" | "default"> = {
  PENDING: "warning",
  APPROVED: "info",
  DELIVERED: "success",
  REJECTED: "default",
};

function formatDate(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RewardPurchasesPanel({
  purchases: initial,
}: {
  purchases: RewardPurchaseRow[];
}) {
  const [purchases, setPurchases] = useState(initial);
  const [filter, setFilter] = useState<PurchaseFilter>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      pending: purchases.filter((p) => p.status === "PENDING").length,
      approved: purchases.filter((p) => p.status === "APPROVED").length,
      delivered: purchases.filter((p) => p.status === "DELIVERED").length,
    }),
    [purchases]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return purchases;
    const statusMap: Record<Exclude<PurchaseFilter, "all">, RewardStatus> = {
      pending: "PENDING",
      approved: "APPROVED",
      delivered: "DELIVERED",
      rejected: "REJECTED",
    };
    return purchases.filter((p) => p.status === statusMap[filter]);
  }, [purchases, filter]);

  async function handleStatusChange(purchaseId: string, status: RewardStatus) {
    setLoadingId(purchaseId);
    try {
      const updated = await updatePurchaseStatus(purchaseId, status);
      setPurchases((current) =>
        current.map((purchase) =>
          purchase.id === purchaseId
            ? {
                ...purchase,
                status: updated.status,
                approvedAt: updated.approvedAt,
                deliveredAt: updated.deliveredAt,
              }
            : purchase
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <ShoppingBag className="h-5 w-5 text-violet-400" />
            Canjes de la tienda
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Revisa lo que ha comprado, aprueba el canje y márcalo como entregado cuando lo reciba.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {counts.pending > 0 && (
            <Badge variant="warning">{counts.pending} pendientes</Badge>
          )}
          {counts.approved > 0 && (
            <Badge variant="info">{counts.approved} por entregar</Badge>
          )}
          <Badge variant="success">{counts.delivered} entregadas</Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(FILTER_LABELS) as PurchaseFilter[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              filter === key
                ? "bg-violet-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {FILTER_LABELS[key]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-slate-400">
          No hay canjes en esta categoría.
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-slate-800">
            {filtered.map((purchase) => (
              <div
                key={purchase.id}
                className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{purchase.reward.title}</p>
                    <Badge variant={STATUS_VARIANTS[purchase.status]}>
                      {STATUS_LABELS[purchase.status]}
                    </Badge>
                  </div>
                  {purchase.reward.description && (
                    <p className="mt-0.5 text-sm text-slate-400">{purchase.reward.description}</p>
                  )}
                  <p className="mt-1 text-sm text-slate-400">
                    {purchase.character.name} · 💎 {purchase.reward.crystalCost}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Canjeada: {formatDate(purchase.purchasedAt)}
                    {purchase.approvedAt && ` · Aprobada: ${formatDate(purchase.approvedAt)}`}
                    {purchase.deliveredAt && ` · Entregada: ${formatDate(purchase.deliveredAt)}`}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {purchase.status === "PENDING" && (
                    <>
                      <Button
                        size="sm"
                        disabled={loadingId === purchase.id}
                        onClick={() => handleStatusChange(purchase.id, "APPROVED")}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={loadingId === purchase.id}
                        onClick={() => handleStatusChange(purchase.id, "REJECTED")}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Rechazar
                      </Button>
                    </>
                  )}
                  {purchase.status === "APPROVED" && (
                    <Button
                      size="sm"
                      disabled={loadingId === purchase.id}
                      onClick={() => handleStatusChange(purchase.id, "DELIVERED")}
                    >
                      <PackageCheck className="mr-1 h-4 w-4" />
                      Marcar entregada
                    </Button>
                  )}
                  {purchase.status === "DELIVERED" && (
                    <span className="inline-flex items-center gap-1 text-sm text-emerald-400">
                      <PackageCheck className="h-4 w-4" />
                      Ya la tiene
                    </span>
                  )}
                  {purchase.status === "REJECTED" && (
                    <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                      <Clock className="h-4 w-4" />
                      Cristales devueltos
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

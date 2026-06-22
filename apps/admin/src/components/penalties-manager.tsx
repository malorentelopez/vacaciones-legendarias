"use client";

import { useState } from "react";
import { Card, Badge, Button } from "@repo/ui";
import { applyPenalty, resetWeeklyPoints } from "@/actions/admin";

interface Character {
  id: string;
  name: string;
  weeklyPoints: number;
}

export function PenaltiesManager({ characters }: { characters: Character[] }) {
  const [selectedId, setSelectedId] = useState(characters[0]?.id ?? "");
  const [points, setPoints] = useState(5);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePenalty(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await applyPenalty(selectedId, points, reason);
    setLoading(false);
    setReason("");
  }

  async function handleReset() {
    if (!confirm("¿Resetear puntos semanales de toda la familia?")) return;
    await resetWeeklyPoints();
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Penalizaciones</h1>

      <Card className="p-4">
        <form onSubmit={handlePenalty} className="space-y-3">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
          >
            {characters.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.weeklyPoints} pts)</option>
            ))}
          </select>
          <div className="flex gap-3">
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              placeholder="Puntos"
              className="w-24 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
            />
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Motivo"
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
            />
          </div>
          <Button type="submit" variant="destructive" disabled={loading}>
            Aplicar penalización
          </Button>
        </form>
      </Card>

      <Button variant="outline" onClick={handleReset}>
        Reset semanal de puntos
      </Button>

      <div className="grid gap-3 sm:grid-cols-2">
        {characters.map((c) => (
          <Card key={c.id} className="p-4">
            <h3 className="font-bold">{c.name}</h3>
            <Badge className="mt-2">{c.weeklyPoints} puntos semanales</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@repo/ui";
import { RotateCcw } from "lucide-react";
import { resetPlayerProgress } from "@/actions/game";

export function ResetProgressButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleReset() {
    const confirmed = window.confirm(
      "¿Reiniciar el progreso de este héroe?\n\nSe borrarán nivel, XP, cristales, misiones, logros, compras y rachas. Tu nombre y avatar no cambiarán."
    );
    if (!confirmed) return;

    setLoading(true);
    setError("");
    try {
      await resetPlayerProgress();
      router.refresh();
    } catch {
      setError("No se pudo reiniciar el progreso.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <div className="space-y-3 p-4">
        <div>
          <p className="text-sm font-semibold text-amber-200">Modo pruebas</p>
          <p className="mt-1 text-xs text-slate-400">
            Reinicia nivel, misiones, logros y economía. El nombre y el avatar se mantienen.
          </p>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={loading}
          className="w-full border-amber-500/40 text-amber-200 hover:bg-amber-500/10"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          {loading ? "Reiniciando..." : "Reiniciar progreso"}
        </Button>
      </div>
    </Card>
  );
}

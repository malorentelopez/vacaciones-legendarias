import { WifiOff } from "lucide-react";
import { CenteredAuthCard } from "@/components/centered-auth-card";
import { RetryButton } from "@/components/retry-button";

export default function OfflinePage() {
  return (
    <CenteredAuthCard
      header={
        <>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-800">
            <WifiOff className="h-7 w-7 text-violet-400" aria-hidden />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-100">Sin conexión</h1>
            <p className="text-slate-400">
              No hay internet ahora mismo. Cuando vuelva la señal, recarga para seguir tu aventura.
            </p>
          </div>
        </>
      }
    >
      <RetryButton />
    </CenteredAuthCard>
  );
}

import { cn } from "../lib/utils";
import { Trophy, Lock } from "lucide-react";

interface AchievementBadgeProps {
  title: string;
  description?: string | null;
  icon?: string;
  unlocked?: boolean;
  claimed?: boolean;
  unlockedAt?: Date;
  claimedAt?: Date | null;
  className?: string;
}

export function AchievementBadge({
  title,
  description,
  unlocked,
  claimed,
  unlockedAt,
  claimedAt,
  className,
}: AchievementBadgeProps) {
  const isClaimable = unlocked && !claimed;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all",
        claimed
          ? "border-amber-500/50 bg-amber-900/20"
          : isClaimable
            ? "border-emerald-500/50 bg-emerald-900/20 ring-1 ring-emerald-500/30"
            : unlocked
              ? "border-amber-500/30 bg-amber-900/10"
              : "border-slate-700 bg-slate-800/30 opacity-60",
        className
      )}
    >
      <div
        className={cn(
          "rounded-full p-3",
          claimed ? "bg-amber-500/20" : isClaimable ? "bg-emerald-500/20" : unlocked ? "bg-amber-500/10" : "bg-slate-700"
        )}
      >
        {unlocked ? (
          <Trophy className={cn("h-8 w-8", claimed || isClaimable ? "text-amber-400" : "text-amber-400/70")} />
        ) : (
          <Lock className="h-8 w-8 text-slate-500" />
        )}
      </div>
      <h4 className="font-semibold text-sm">{title}</h4>
      {description && <p className="text-xs text-slate-400">{description}</p>}
      {isClaimable && (
        <span className="text-xs font-medium text-emerald-400">¡Listo para reclamar!</span>
      )}
      {claimed && claimedAt && (
        <span className="text-xs text-amber-400">
          Reclamado el {new Date(claimedAt).toLocaleDateString("es-ES")}
        </span>
      )}
      {unlocked && !claimed && unlockedAt && (
        <span className="text-xs text-slate-500">
          Completado el {new Date(unlockedAt).toLocaleDateString("es-ES")}
        </span>
      )}
    </div>
  );
}

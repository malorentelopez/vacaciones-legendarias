import { cn } from "../lib/utils";
import { Trophy, Lock } from "lucide-react";

interface AchievementBadgeProps {
  title: string;
  description?: string | null;
  icon?: string;
  unlocked?: boolean;
  unlockedAt?: Date;
  className?: string;
}

export function AchievementBadge({
  title,
  description,
  unlocked,
  unlockedAt,
  className,
}: AchievementBadgeProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all",
        unlocked
          ? "border-amber-500/50 bg-amber-900/20"
          : "border-slate-700 bg-slate-800/30 opacity-60",
        className
      )}
    >
      <div className={cn("rounded-full p-3", unlocked ? "bg-amber-500/20" : "bg-slate-700")}>
        {unlocked ? (
          <Trophy className="h-8 w-8 text-amber-400" />
        ) : (
          <Lock className="h-8 w-8 text-slate-500" />
        )}
      </div>
      <h4 className="font-semibold text-sm">{title}</h4>
      {description && <p className="text-xs text-slate-400">{description}</p>}
      {unlocked && unlockedAt && (
        <span className="text-xs text-amber-400">
          {new Date(unlockedAt).toLocaleDateString("es-ES")}
        </span>
      )}
    </div>
  );
}

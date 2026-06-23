"use client";

import { Badge, SkillIcon } from "@repo/ui";
import { CheckCircle2 } from "lucide-react";
import { MangaPanel } from "@/components/manga/manga-panel";
import { MangaActionButton } from "@/components/manga/manga-action-button";
import { MANGA_COPY } from "@/lib/manga-copy";
import { getMissionIcon } from "@/lib/mission-icons";

interface QuestCardProps {
  title: string;
  description?: string | null;
  type?: string;
  xpReward: number;
  crystalReward?: number;
  skillIcon?: string;
  skillColor?: string;
  completed?: boolean;
  active?: boolean;
  onComplete?: () => void;
  loading?: boolean;
}

export function QuestCard({
  title,
  description,
  type,
  xpReward,
  crystalReward = 0,
  skillIcon,
  skillColor,
  completed,
  active,
  onComplete,
  loading,
}: QuestCardProps) {
  const missionIcon = getMissionIcon(type);

  return (
    <MangaPanel variant="quest" active={active} completed={completed} className="relative overflow-hidden bg-slate-900/80 p-4">
      {completed && <span className="manga-quest-stamp">CLEAR!</span>}
      <div className="flex items-start gap-3">
        <span className="text-3xl leading-none" aria-hidden>
          {missionIcon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className={`text-lg font-bold ${completed ? "text-slate-400 line-through" : "text-white"}`}>
                {title}
              </h3>
              {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
            </div>
            {completed && <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {skillIcon && <SkillIcon icon={skillIcon} color={skillColor} size="sm" />}
              <Badge variant="info">+{xpReward} XP</Badge>
              {crystalReward > 0 && <Badge variant="warning">+{crystalReward} 💎</Badge>}
              {active && !completed && (
                <Badge className="manga-badge-active border-amber-400/50 bg-amber-500/15 text-amber-200">
                  EN CURSO
                </Badge>
              )}
            </div>
            {!completed && onComplete && (
              <MangaActionButton size="sm" onClick={onComplete} disabled={loading}>
                {loading ? "..." : MANGA_COPY.completeMission}
              </MangaActionButton>
            )}
          </div>
        </div>
      </div>
    </MangaPanel>
  );
}

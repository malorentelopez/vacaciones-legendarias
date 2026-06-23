"use client";

import { cn } from "@repo/ui";
import { Clock, ChevronDown } from "lucide-react";
import type { RouteNodeStatus } from "@/lib/route-map";

function formatTimeRange(start: string, end: string | null) {
  return end ? `${start} – ${end}` : `${start} en adelante`;
}

interface RouteMapNodeProps {
  index: number;
  title: string;
  description: string | null;
  icon: string | null;
  startTime: string;
  endTime: string | null;
  status: RouteNodeStatus;
  expanded: boolean;
  hasMissions: boolean;
  missionsDone: boolean;
  isLast: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

export function RouteMapNode({
  index,
  title,
  description,
  icon,
  startTime,
  endTime,
  status,
  expanded,
  hasMissions,
  missionsDone,
  isLast,
  onToggle,
  children,
}: RouteMapNodeProps) {
  const canExpand = hasMissions;

  return (
    <div className="route-map-node-row relative flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "route-map-node-circle flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] text-sm font-bold",
            status === "current" && "route-map-node-current border-[var(--theme-primary)] bg-[var(--theme-primary)] text-white",
            status === "completed" && "route-map-node-completed border-emerald-400 bg-emerald-600 text-white",
            status === "upcoming" && "route-map-node-upcoming border-slate-600 bg-slate-800 text-slate-500"
          )}
          aria-hidden
        >
          {status === "completed" ? "✓" : index + 1}
        </div>
        {!isLast && <div className="route-map-connector mt-1 w-1 flex-1 min-h-[1.5rem]" aria-hidden />}
      </div>

      <div className="min-w-0 flex-1 pb-6">
        <button
          type="button"
          onClick={canExpand ? onToggle : undefined}
          className={cn(
            "manga-panel route-map-panel w-full p-4 text-left transition-all",
            status === "current" && "route-map-panel-current manga-panel-active",
            status === "completed" && "route-map-panel-completed",
            status === "upcoming" && "route-map-panel-upcoming opacity-75",
            canExpand && "cursor-pointer hover:brightness-110"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTimeRange(startTime, endTime)}
                </span>
                {status === "current" && (
                  <span className="route-map-badge font-display text-[10px] uppercase tracking-wider text-amber-200">
                    ¡Ahora!
                  </span>
                )}
                {missionsDone && hasMissions && (
                  <span className="font-display text-[10px] uppercase tracking-wider text-emerald-300">
                    Clear!
                  </span>
                )}
              </div>
              <div className="flex items-start gap-2">
                {icon && <span className="text-2xl leading-none">{icon}</span>}
                <div>
                  <h3 className="font-display text-lg tracking-wide text-white">{title}</h3>
                  {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
                </div>
              </div>
            </div>
            {canExpand && (
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-slate-400 transition-transform",
                  expanded && "rotate-180"
                )}
              />
            )}
          </div>
        </button>

        {expanded && hasMissions && (
          <div className="route-map-missions mt-2 space-y-2 pl-1">{children}</div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { RouteMapBlock } from "@/lib/route-map";
import { getCurrentBlockIndex, getRouteNodeStatus } from "@/lib/route-map";
import { RouteMapNode } from "@/components/manga/route-map-node";

interface LegendaryRouteMapProps {
  blocks: RouteMapBlock[];
  dayType?: string;
  renderMissions: (block: RouteMapBlock, isCurrent: boolean) => ReactNode;
}

export function LegendaryRouteMap({ blocks, dayType, renderMissions }: LegendaryRouteMapProps) {
  const currentIndex = getCurrentBlockIndex(blocks);
  const currentBlockId = currentIndex >= 0 ? blocks[currentIndex]?.id : null;
  const [expandedId, setExpandedId] = useState<string | null>(currentBlockId);

  useEffect(() => {
    setExpandedId(currentBlockId);
  }, [currentBlockId]);

  let lastSection: string | null = null;

  return (
    <div className="route-map relative">
      {dayType === "FRIDAY" && (
        <div className="route-map-banner route-map-banner-friday manga-panel mb-6 p-4 text-center">
          <p className="font-display text-2xl tracking-wide text-amber-200">¡Viernes legendario!</p>
          <p className="mt-1 text-sm text-slate-300">Demuestra tu poder esta semana</p>
        </div>
      )}

      <div className="space-y-0">
        {blocks.map((block, index) => {
          const showSection = block.section && block.section !== lastSection;
          if (showSection) lastSection = block.section;

          const status = getRouteNodeStatus(block, index, currentIndex);
          const hasMissions = block.missions.length > 0;
          const missionsDone = hasMissions && block.missions.every((mission) => mission.completed);
          const expanded = expandedId === block.id;

          return (
            <div key={block.id}>
              {showSection && (
                <div className="route-map-section-banner mb-4 pl-14">
                  <span className="font-display text-sm uppercase tracking-[0.2em] text-[var(--theme-heading)]">
                    ⚔ {block.section}
                  </span>
                </div>
              )}

              <RouteMapNode
                index={index}
                title={block.title}
                description={block.description}
                icon={block.icon}
                startTime={block.startTime}
                endTime={block.endTime}
                status={status}
                expanded={expanded}
                hasMissions={hasMissions}
                missionsDone={missionsDone}
                isLast={index === blocks.length - 1}
                onToggle={() => setExpandedId((id) => (id === block.id ? null : block.id))}
              >
                {renderMissions(block, block.isCurrent)}
              </RouteMapNode>
            </div>
          );
        })}
      </div>
    </div>
  );
}

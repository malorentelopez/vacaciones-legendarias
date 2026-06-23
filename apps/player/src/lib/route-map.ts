export type RouteNodeStatus = "current" | "completed" | "upcoming";

export interface RouteMapBlock {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  startTime: string;
  endTime: string | null;
  section: string | null;
  isCurrent: boolean;
  missions: { id: string; completed: boolean }[];
}

export function getRouteNodeStatus(
  block: RouteMapBlock,
  index: number,
  currentIndex: number
): RouteNodeStatus {
  if (block.isCurrent) return "current";

  const missionsDone =
    block.missions.length === 0 || block.missions.every((mission) => mission.completed);

  if (block.missions.length > 0) {
    return missionsDone ? "completed" : "upcoming";
  }

  if (currentIndex >= 0 && index < currentIndex) return "completed";
  return "upcoming";
}

export function getCurrentBlockIndex(blocks: RouteMapBlock[]): number {
  return blocks.findIndex((block) => block.isCurrent);
}

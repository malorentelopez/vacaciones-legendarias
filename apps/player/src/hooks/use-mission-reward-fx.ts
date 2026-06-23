"use client";

import { useCallback, useState } from "react";
import type { FloatingRewardPayload } from "@/components/manga/floating-reward-fx";

interface ActiveMissionFx {
  missionId: string;
  payload: FloatingRewardPayload;
}

export function useMissionRewardFx() {
  const [activeFx, setActiveFx] = useState<ActiveMissionFx | null>(null);

  const triggerMissionFx = useCallback((missionId: string, payload: FloatingRewardPayload) => {
    setActiveFx({ missionId, payload });
  }, []);

  const clearMissionFx = useCallback(() => setActiveFx(null), []);

  return { activeFx, triggerMissionFx, clearMissionFx };
}

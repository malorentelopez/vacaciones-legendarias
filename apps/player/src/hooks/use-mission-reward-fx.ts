"use client";

import { useCallback, useState } from "react";
import type { FloatingRewardPayload } from "@/components/manga/floating-reward-fx";
import { getMissionSfx } from "@/lib/mission-icons";

interface ActiveMissionFx {
  missionId: string;
  payload: FloatingRewardPayload;
}

export function useMissionRewardFx(themeKey: string) {
  const [activeFx, setActiveFx] = useState<ActiveMissionFx | null>(null);

  const triggerMissionFx = useCallback(
    (missionId: string, type: string | undefined, xp: number, crystals: number) => {
      setActiveFx({
        missionId,
        payload: {
          sfx: getMissionSfx(type, themeKey),
          xp,
          crystals,
        },
      });
    },
    [themeKey]
  );

  const clearMissionFx = useCallback(() => setActiveFx(null), []);

  return { activeFx, triggerMissionFx, clearMissionFx };
}

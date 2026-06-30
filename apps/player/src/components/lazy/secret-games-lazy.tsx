"use client";

import dynamic from "next/dynamic";
import { PlayerPageSkeleton } from "@/components/player-nav-skeleton";

const gameLoading = () => <PlayerPageSkeleton className="py-4" />;

export const DragonChestGameLazy = dynamic(
  () => import("@/components/secrets/dragon-chest-game").then((mod) => mod.DragonChestGame),
  { loading: gameLoading }
);

export const MangaPowerComboGameLazy = dynamic(
  () => import("@/components/secrets/manga-power-combo-game").then((mod) => mod.MangaPowerComboGame),
  { loading: gameLoading }
);

export const OceanFishingGameLazy = dynamic(
  () => import("@/components/secrets/ocean-fishing-game").then((mod) => mod.OceanFishingGame),
  { loading: gameLoading }
);

export const DailyAgendaLazy = dynamic(
  () => import("@/components/daily-agenda").then((mod) => mod.DailyAgenda),
  { loading: gameLoading }
);

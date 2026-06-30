"use client";

import dynamic from "next/dynamic";
import { PlayerPageSkeleton } from "@/components/player-nav-skeleton";

export const AvatarCustomizerLazy = dynamic(
  () => import("@/components/avatar-customizer").then((mod) => mod.AvatarCustomizer),
  { loading: () => <PlayerPageSkeleton /> }
);

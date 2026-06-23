"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { Zap } from "lucide-react";
import { MangaHudBar } from "@/components/manga/manga-hud-bar";
import { MANGA_COPY } from "@/lib/manga-copy";
import { useTheme } from "@/components/theme-provider";
import { themeProgressBar } from "@/lib/theme-ui";

interface PowerGaugeProps {
  level: number;
  xpInLevel: number;
  xpNeeded: number;
  progress: number;
}

export function PowerGauge({ level, xpInLevel, xpNeeded, progress }: PowerGaugeProps) {
  const theme = useTheme();

  return (
    <Card className="manga-panel manga-panel-power h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="theme-icon h-5 w-5" style={{ color: theme.colors.secondary }} />
          <span className="font-display tracking-wide">{MANGA_COPY.powerLabel}</span>
        </CardTitle>
        <p className="text-sm text-slate-400">
          {xpInLevel} / {xpNeeded} XP → Nv. {level + 1}
        </p>
      </CardHeader>
      <CardContent>
        <MangaHudBar value={progress} label={MANGA_COPY.hudPower} barStyle={themeProgressBar(theme)} />
      </CardContent>
    </Card>
  );
}

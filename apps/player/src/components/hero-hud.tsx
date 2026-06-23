"use client";

import Link from "next/link";
import { CharacterPortrait } from "@repo/ui";
import { PetCompanion } from "@/components/pet-companion";
import { CrystalCounter } from "@/components/crystal-counter";
import { MangaHudBar } from "@/components/manga/manga-hud-bar";
import { MANGA_COPY } from "@/lib/manga-copy";
import { useTheme } from "@/components/theme-provider";
import { themeProgressBar } from "@/lib/theme-ui";

export interface HeroHudData {
  name: string;
  roleName: string;
  level: number;
  crystals: number;
  portraitSrc: string;
  xpProgress: number;
  streak?: number;
  petEmoji?: string | null;
}

export function HeroHud({ hero }: { hero: HeroHudData }) {
  const theme = useTheme();

  return (
    <div className="manga-hero-hud mx-auto w-full max-w-4xl px-3 py-2 md:px-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/avatar" className="relative shrink-0">
          <CharacterPortrait
            imageSrc={hero.portraitSrc}
            alt={hero.roleName}
            primaryColor={theme.colors.primary}
            secondaryColor={theme.colors.secondary}
            size="sm"
            className="theme-ring ring-2"
          />
          {hero.petEmoji && <PetCompanion emoji={hero.petEmoji} size="sm" />}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs font-bold uppercase tracking-wide text-slate-200 sm:text-sm">
              {hero.name}
            </p>
            <span className="font-display shrink-0 text-xs font-bold text-[var(--theme-heading)] sm:text-sm">
              Nv.{hero.level}
            </span>
            {hero.streak != null && hero.streak > 0 && (
              <span className="manga-streak-badge shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-orange-200 sm:text-xs">
                🔥 x{hero.streak}
              </span>
            )}
          </div>
          <MangaHudBar
            value={hero.xpProgress}
            label={MANGA_COPY.hudPower}
            barStyle={themeProgressBar(theme)}
            showValue={false}
            className="mt-1"
          />
        </div>
        <CrystalCounter crystals={hero.crystals} compact />
      </div>
    </div>
  );
}

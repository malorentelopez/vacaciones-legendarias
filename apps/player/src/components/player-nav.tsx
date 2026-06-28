"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  Map,
  Sparkles,
  Trophy,
  Gem,
  Swords,
  User,
  LogOut,
  MoreHorizontal,
  X,
  Scroll,
} from "lucide-react";
import { cn, AppLogo, mobileBottomNavOffset, mobileBottomNavPaddingStyle } from "@repo/ui";
import { logout } from "@/actions/auth";
import { CrystalCounter } from "@/components/crystal-counter";
import { SecretCrystalTrigger } from "@/components/secrets/secret-crystal-trigger";
import { HeroHud, type HeroHudData } from "@/components/hero-hud";
import { MANGA_COPY } from "@/lib/manga-copy";
import { useTheme } from "./theme-provider";
import {
  PlayerDrawerNavLink,
  PlayerMenuNavLink,
  PlayerNavLink,
} from "@/components/player-nav-link";

const primaryNavItems = [
  { href: "/", icon: Home, label: "Campamento", mobileLabel: "Campamento" },
  { href: "/ruta", icon: Map, label: "Ruta legendaria", mobileLabel: "Ruta" },
  { href: "/achievements", icon: Trophy, label: "Logros", mobileLabel: "Logros" },
] as const;

const moreNavItems = [
  { href: "/side-quests", icon: Scroll, label: MANGA_COPY.sideQuestsNav },
  { href: "/skills", icon: Sparkles, label: "Habilidades" },
  { href: "/store", icon: Gem, label: "Mercader" },
  { href: "/boss-battles", icon: Swords, label: "Boss" },
  { href: "/avatar", icon: User, label: "Héroe" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function PlayerNav({
  crystals,
  hero,
  themeKey,
  oceanFishing,
}: {
  crystals: number;
  hero?: HeroHudData;
  themeKey?: string;
  oceanFishing?: {
    eligible: boolean;
    discovered: boolean;
    completed: boolean;
  };
}) {
  const pathname = usePathname();
  const theme = useTheme();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive = moreNavItems.some((item) => isActive(pathname, item.href));

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const showOceanFishing = themeKey === "ocean" && oceanFishing;

  function renderCrystalCounter(compact?: boolean) {
    const counter = <CrystalCounter crystals={crystals} compact={compact} />;
    if (!showOceanFishing) return counter;

    return (
      <div className="relative">
        <SecretCrystalTrigger
          eligible={oceanFishing.eligible}
          discovered={oceanFishing.discovered}
          completed={oceanFishing.completed}
        >
          {counter}
        </SecretCrystalTrigger>
      </div>
    );
  }

  return (
    <>
      {/* Desktop: barra superior */}
      <nav className="theme-nav-border sticky top-0 z-50 hidden border-b bg-slate-900/80 backdrop-blur-lg md:block">
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-2">
          <Link href="/" prefetch className="mr-1 shrink-0 touch-manipulation active:opacity-80">
            <AppLogo variant="icon" size="sm" />
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-1">
            {primaryNavItems.map(({ href, icon, label }) => (
              <PlayerNavLink
                key={href}
                href={href}
                icon={icon}
                label={label}
                active={isActive(pathname, href)}
              />
            ))}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((open) => !open)}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-colors touch-manipulation active:opacity-80",
                  moreOpen || moreActive ? "text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
                style={moreOpen || moreActive ? { backgroundColor: theme.colors.navActive } : undefined}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span>Más</span>
              </button>
              {moreOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Cerrar menú"
                    className="fixed inset-0 z-40"
                    onClick={() => setMoreOpen(false)}
                  />
                  <div className="theme-nav-border absolute left-0 top-full z-50 mt-1 min-w-[11rem] overflow-hidden rounded-xl border bg-slate-900/95 py-1 shadow-xl backdrop-blur-lg">
                    {moreNavItems.map(({ href, icon, label }) => (
                      <PlayerMenuNavLink
                        key={href}
                        href={href}
                        icon={icon}
                        label={label}
                        active={isActive(pathname, href)}
                        onClick={() => setMoreOpen(false)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          {renderCrystalCounter()}
          <form action={logout} className="shrink-0">
            <button
              type="submit"
              title="Salir"
              className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white touch-manipulation active:opacity-80"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </form>
        </div>
      </nav>
      {hero && (
        <div className="theme-nav-border hidden border-b md:block">
          <HeroHud hero={{ ...hero, crystals }} />
        </div>
      )}

      {/* Móvil: logo y cristales arriba */}
      <header className="theme-nav-border relative flex items-center justify-center border-b bg-slate-900/60 px-4 py-3 backdrop-blur-lg md:hidden">
        <Link href="/" prefetch className="inline-flex max-w-[10rem] touch-manipulation active:opacity-80 sm:max-w-[12rem]">
          <AppLogo variant="full" size="sm" />
        </Link>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {renderCrystalCounter(true)}
        </div>
      </header>
      {hero && (
        <div className="theme-nav-border border-b md:hidden">
          <HeroHud hero={{ ...hero, crystals }} />
        </div>
      )}

      {/* Móvil: menú expandido */}
      {moreOpen && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMoreOpen(false)}
          />
          <div
            className="theme-nav-border fixed inset-x-4 z-50 overflow-hidden rounded-2xl border bg-slate-900/95 shadow-xl backdrop-blur-lg md:hidden"
            style={{ bottom: mobileBottomNavOffset }}
          >
            <div className="flex items-center justify-between border-b border-slate-700/50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-200">Más opciones</p>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white touch-manipulation active:opacity-80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1 p-2">
              {moreNavItems.map(({ href, icon, label }) => (
                <PlayerDrawerNavLink
                  key={href}
                  href={href}
                  icon={icon}
                  label={label}
                  active={isActive(pathname, href)}
                  onClick={() => setMoreOpen(false)}
                />
              ))}
            </div>
            <form action={logout} className="border-t border-slate-700/50 p-2">
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white touch-manipulation active:opacity-80"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/80">
                  <LogOut className="h-4 w-4" />
                </span>
                Salir
              </button>
            </form>
          </div>
        </>
      )}

      {/* Móvil: barra inferior fija */}
      <nav className="theme-nav-border fixed inset-x-0 bottom-0 z-50 border-t bg-slate-900/80 backdrop-blur-lg md:hidden">
        <div
          className="mx-auto grid max-w-4xl grid-cols-4 px-2 pt-1"
          style={mobileBottomNavPaddingStyle}
        >
          {primaryNavItems.map(({ href, icon, label, mobileLabel }) => (
            <PlayerNavLink
              key={href}
              href={href}
              icon={icon}
              label={mobileLabel}
              active={isActive(pathname, href)}
              compact
            />
          ))}
          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors touch-manipulation active:opacity-80",
              moreOpen || moreActive ? "text-white" : "text-slate-400"
            )}
            style={moreOpen || moreActive ? { backgroundColor: theme.colors.navActive } : undefined}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span>Más</span>
          </button>
        </div>
      </nav>
    </>
  );
}

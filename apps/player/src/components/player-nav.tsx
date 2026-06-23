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
import { cn, AppLogo } from "@repo/ui";
import { logout } from "@/actions/auth";
import { CrystalCounter } from "@/components/crystal-counter";
import { HeroHud, type HeroHudData } from "@/components/hero-hud";
import { MANGA_COPY } from "@/lib/manga-copy";
import { useTheme } from "./theme-provider";

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

function NavLink({
  href,
  icon: Icon,
  label,
  active,
  onClick,
  compact,
}: {
  href: string;
  icon: typeof Home;
  label: string;
  active: boolean;
  onClick?: () => void;
  compact?: boolean;
}) {
  const theme = useTheme();

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 whitespace-nowrap rounded-xl transition-colors",
        compact
          ? "flex-col gap-1 px-2 py-1.5 text-[10px] font-medium"
          : "px-3 py-2 text-sm",
        active ? "text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
      )}
      style={active ? { backgroundColor: theme.colors.navActive } : undefined}
    >
      <Icon className={compact ? "h-5 w-5" : "h-4 w-4"} />
      <span>{label}</span>
    </Link>
  );
}

export function PlayerNav({ crystals, hero }: { crystals: number; hero?: HeroHudData }) {
  const pathname = usePathname();
  const theme = useTheme();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive = moreNavItems.some((item) => isActive(pathname, item.href));

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop: barra superior */}
      <nav className="theme-nav-border sticky top-0 z-50 hidden border-b bg-slate-900/80 backdrop-blur-lg md:block">
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-2">
          <Link href="/" className="mr-1 shrink-0">
            <AppLogo variant="icon" size="sm" />
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-1">
            {primaryNavItems.map(({ href, icon, label }) => (
              <NavLink
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
                  "flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-colors",
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
                    {moreNavItems.map(({ href, icon: Icon, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMoreOpen(false)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                          isActive(pathname, href)
                            ? "text-white"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                        style={isActive(pathname, href) ? { backgroundColor: theme.colors.navActive } : undefined}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <CrystalCounter crystals={crystals} />
          <form action={logout} className="shrink-0">
            <button
              type="submit"
              title="Salir"
              className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
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
        <Link href="/" className="inline-flex max-w-[10rem] sm:max-w-[12rem]">
          <AppLogo variant="full" size="sm" />
        </Link>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <CrystalCounter crystals={crystals} compact />
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
          <div className="theme-nav-border fixed inset-x-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 overflow-hidden rounded-2xl border bg-slate-900/95 shadow-xl backdrop-blur-lg md:hidden">
            <div className="flex items-center justify-between border-b border-slate-700/50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-200">Más opciones</p>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1 p-2">
              {moreNavItems.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-3 text-sm transition-colors",
                    isActive(pathname, href)
                      ? "text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  )}
                  style={isActive(pathname, href) ? { backgroundColor: theme.colors.navActive } : undefined}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/80">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </Link>
              ))}
            </div>
            <form action={logout} className="border-t border-slate-700/50 p-2">
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
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
          style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
        >
          {primaryNavItems.map(({ href, icon, label, mobileLabel }) => (
            <NavLink
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
              "flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors",
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

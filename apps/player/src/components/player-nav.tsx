"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Map, Sparkles, Trophy, Gem, Swords, User, LogOut,
} from "lucide-react";
import { cn, AppLogo } from "@repo/ui";
import { logout } from "@/actions/auth";
import { useTheme } from "./theme-provider";

const navItems = [
  { href: "/", icon: Home, label: "Campamento" },
  { href: "/ruta", icon: Map, label: "Ruta legendaria" },
  { href: "/skills", icon: Sparkles, label: "Poderes" },
  { href: "/achievements", icon: Trophy, label: "Logros" },
  { href: "/store", icon: Gem, label: "Cofre" },
  { href: "/boss-battles", icon: Swords, label: "Boss" },
  { href: "/avatar", icon: User, label: "Héroe" },
];

export function PlayerNav() {
  const pathname = usePathname();
  const theme = useTheme();

  return (
    <nav className="theme-nav-border sticky top-0 z-50 border-b bg-slate-900/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-2">
        <Link href="/" className="mr-1 shrink-0">
          <AppLogo variant="icon" size="sm" />
        </Link>
        <div className="flex flex-1 items-center gap-1 overflow-x-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-colors",
                  active ? "text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
                style={active ? { backgroundColor: theme.colors.navActive } : undefined}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>
        <form action={logout} className="shrink-0">
          <button
            type="submit"
            title="Salir"
            className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </form>
      </div>
    </nav>
  );
}

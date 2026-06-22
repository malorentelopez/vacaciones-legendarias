"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Target, Sparkles, Trophy, ShoppingBag, Swords, Calendar, Clock, User,
} from "lucide-react";
import { cn, AppLogo } from "@repo/ui";
import { useTheme } from "./theme-provider";

const navItems = [
  { href: "/", icon: Home, label: "Inicio" },
  { href: "/missions", icon: Target, label: "Misiones" },
  { href: "/skills", icon: Sparkles, label: "Skills" },
  { href: "/achievements", icon: Trophy, label: "Logros" },
  { href: "/store", icon: ShoppingBag, label: "Tienda" },
  { href: "/boss-battles", icon: Swords, label: "Boss" },
  { href: "/calendar", icon: Calendar, label: "Agenda" },
  { href: "/timeline", icon: Clock, label: "Historia" },
  { href: "/avatar", icon: User, label: "Avatar" },
];

export function PlayerNav() {
  const pathname = usePathname();
  const theme = useTheme();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-2">
        <Link href="/" className="mr-1 shrink-0">
          <AppLogo variant="icon" size="sm" />
        </Link>
        <div className="flex flex-1 items-center gap-1 overflow-x-auto">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-colors",
              pathname === href
                ? "text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
            style={
              pathname === href
                ? { backgroundColor: theme.colors.navActive }
                : undefined
            }
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        ))}
        </div>
      </div>
    </nav>
  );
}

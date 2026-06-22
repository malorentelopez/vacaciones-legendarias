"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, Target, Trophy, Gift, Swords, Settings,
  Clock, AlertTriangle, BarChart3, LogOut, Menu, X,
} from "lucide-react";
import { cn, AppLogo } from "@repo/ui";
import { logout } from "@/actions/auth";

const mainNavItems = [
  { href: "/", icon: LayoutDashboard, label: "Inicio" },
  { href: "/characters", icon: Users, label: "Personajes" },
  { href: "/missions", icon: Target, label: "Misiones" },
  { href: "/achievements", icon: Trophy, label: "Logros" },
];

const allNavItems = [
  ...mainNavItems,
  { href: "/rewards", icon: Gift, label: "Recompensas" },
  { href: "/bosses", icon: Swords, label: "Retos del mes" },
  { href: "/levels", icon: BarChart3, label: "Niveles" },
  { href: "/penalties", icon: AlertTriangle, label: "Penalizaciones" },
  { href: "/screen-time", icon: Settings, label: "Tiempo pantalla" },
  { href: "/timeline", icon: Clock, label: "Timeline" },
];

export function AdminNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLink = ({ href, icon: Icon, label }: { href: string; icon: typeof LayoutDashboard; label: string }) => (
    <Link
      href={href}
      onClick={() => setMobileOpen(false)}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
        pathname === href
          ? "bg-violet-600 text-white"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <AppLogo variant="icon" size="sm" />
          <div>
            <p className="text-xs font-semibold text-violet-300">Admin</p>
            <p className="text-xs text-slate-500">{userName}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-72 flex-col bg-slate-900 p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold">Menú</span>
              <button type="button" onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto">
              {allNavItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </nav>
            <form action={logout} className="mt-4 border-t border-slate-800 pt-4">
              <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800">
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </form>
          </aside>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-800 bg-slate-900/95 backdrop-blur lg:hidden">
        {mainNavItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]",
              pathname === href ? "text-violet-400" : "text-slate-500"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-900 lg:block">
        <div className="sticky top-0 flex h-screen flex-col p-4">
          <div className="mb-6 px-1">
            <AppLogo variant="full" size="sm" className="mb-2" />
            <p className="text-sm text-slate-400">Admin — {userName}</p>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {allNavItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

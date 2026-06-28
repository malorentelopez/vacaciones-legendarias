"use client";

import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard, Users, Target, Trophy, Gift, Swords, Settings,
  Clock, AlertTriangle, BarChart3, LogOut, Menu, X, CalendarDays, UserCircle, TrendingUp,
} from "lucide-react";
import { cn, AppLogo, mobileBottomNavPaddingStyle, mobileTopBarClass } from "@repo/ui";
import { logout } from "@/actions/auth";
import { AdminNavLink } from "@/components/admin-nav-link";

const mainNavItems = [
  { href: "/", icon: LayoutDashboard, label: "Inicio" },
  { href: "/characters", icon: Users, label: "Personajes" },
  { href: "/missions", icon: Target, label: "Misiones" },
  { href: "/achievements", icon: Trophy, label: "Logros" },
];

const allNavItems = [
  ...mainNavItems,
  { href: "/schedule", icon: CalendarDays, label: "Agenda" },
  { href: "/rewards", icon: Gift, label: "Recompensas" },
  { href: "/economy", icon: TrendingUp, label: "Economía" },
  { href: "/bosses", icon: Swords, label: "Retos del mes" },
  { href: "/levels", icon: BarChart3, label: "Niveles" },
  { href: "/penalties", icon: AlertTriangle, label: "Penalizaciones" },
  { href: "/screen-time", icon: Settings, label: "Tiempo pantalla" },
  { href: "/timeline", icon: Clock, label: "Timeline" },
  { href: "/settings", icon: UserCircle, label: "Mi cuenta" },
];

function UserFooter({ userName, onLogoutClick }: { userName: string; onLogoutClick?: () => void }) {
  return (
    <div className="border-t border-slate-800 pt-4">
      <div className="mb-2 px-3">
        <p className="truncate text-sm font-medium text-slate-200">{userName}</p>
        <p className="text-xs text-slate-500">Administrador</p>
      </div>
      <Link
        href="/settings"
        prefetch
        onClick={onLogoutClick}
        className="mb-1 flex w-full touch-manipulation items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white active:opacity-80"
      >
        <UserCircle className="h-4 w-4 shrink-0" />
        Mi cuenta
      </Link>
      <form action={logout}>
        <button
          type="submit"
          onClick={onLogoutClick}
          className="flex w-full touch-manipulation items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white active:opacity-80"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}

export function AdminNav({ userName }: { userName: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <header className={cn("fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 backdrop-blur lg:hidden", mobileTopBarClass)}>
        <AppLogo variant="icon" size="sm" />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="touch-manipulation rounded-lg p-2 text-slate-400 hover:bg-slate-800 active:opacity-80"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-72 flex-col bg-slate-900 p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-2">
              <AppLogo variant="full" fullWidth className="min-w-0 flex-1" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="shrink-0 touch-manipulation rounded-lg p-1.5 hover:bg-slate-800 active:opacity-80"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto">
              {allNavItems.map((item) => (
                <AdminNavLink
                  key={item.href}
                  {...item}
                  layout="sidebar"
                  onNavigate={() => setMobileOpen(false)}
                />
              ))}
            </nav>
            <UserFooter userName={userName} onLogoutClick={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-800 bg-slate-900/95 backdrop-blur lg:hidden"
        style={mobileBottomNavPaddingStyle}
      >
        {mainNavItems.map((item) => (
          <AdminNavLink key={item.href} {...item} layout="bottom" />
        ))}
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-900 lg:block">
        <div className="sticky top-0 flex h-screen flex-col px-3 py-4">
          <div className="mb-6 px-1">
            <AppLogo variant="full" fullWidth />
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {allNavItems.map((item) => (
              <AdminNavLink key={item.href} {...item} layout="sidebar" />
            ))}
          </nav>
          <UserFooter userName={userName} />
        </div>
      </aside>
    </>
  );
}

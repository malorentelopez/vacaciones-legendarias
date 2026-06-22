"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Target, Trophy, Gift, Swords, Settings,
  Clock, AlertTriangle, BarChart3, LogOut,
} from "lucide-react";
import { cn } from "@repo/ui";
import { logout } from "@/actions/auth";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/characters", icon: Users, label: "Personajes" },
  { href: "/missions", icon: Target, label: "Misiones" },
  { href: "/achievements", icon: Trophy, label: "Logros" },
  { href: "/rewards", icon: Gift, label: "Recompensas" },
  { href: "/bosses", icon: Swords, label: "Boss Battles" },
  { href: "/levels", icon: BarChart3, label: "Niveles" },
  { href: "/penalties", icon: AlertTriangle, label: "Penalizaciones" },
  { href: "/screen-time", icon: Settings, label: "Tiempo pantalla" },
  { href: "/timeline", icon: Clock, label: "Timeline" },
];

export function AdminNav({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-slate-800 bg-slate-900 lg:block">
      <div className="flex h-full flex-col p-4">
        <div className="mb-6 px-2">
          <h1 className="text-lg font-bold text-violet-400">Verano Nivel 3</h1>
          <p className="text-sm text-slate-400">Admin — {userName}</p>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                pathname === href
                  ? "bg-violet-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}

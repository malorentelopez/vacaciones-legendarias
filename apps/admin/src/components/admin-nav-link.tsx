"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@repo/ui";

function isNavActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItemIndicator({
  href,
  icon: Icon,
  label,
  layout,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  layout: "bottom" | "sidebar";
}) {
  const pathname = usePathname();
  const { pending } = useLinkStatus();
  const active = isNavActive(pathname, href);

  if (layout === "bottom") {
    return (
      <>
        <Icon
          className={cn(
            "h-5 w-5 transition-opacity",
            pending && "opacity-40",
            active && !pending && "text-violet-400"
          )}
        />
        <span
          className={cn(
            "transition-opacity",
            pending && "opacity-40",
            active && !pending ? "text-violet-400" : "text-slate-500"
          )}
        >
          {label}
        </span>
        {pending ? (
          <span className="absolute inset-x-2 top-1 h-0.5 rounded-full bg-violet-400" aria-hidden />
        ) : null}
      </>
    );
  }

  return (
    <>
      <Icon className={cn("h-4 w-4 shrink-0", pending && "opacity-50")} />
      <span className={cn(pending && "opacity-70")}>{label}</span>
      {pending ? (
        <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" aria-hidden />
      ) : null}
    </>
  );
}

export function AdminNavLink({
  href,
  icon,
  label,
  layout,
  onNavigate,
  className,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  layout: "bottom" | "sidebar";
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const active = isNavActive(pathname, href);

  return (
    <Link
      href={href}
      prefetch
      onClick={onNavigate}
      className={cn(
        layout === "bottom"
          ? "relative flex flex-1 touch-manipulation flex-col items-center gap-0.5 pt-2 text-[10px] active:opacity-70"
          : "flex touch-manipulation items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors active:opacity-80",
        layout === "sidebar" &&
          (active ? "bg-violet-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"),
        className
      )}
      aria-current={active ? "page" : undefined}
    >
      <NavItemIndicator href={href} icon={icon} label={label} layout={layout} />
    </Link>
  );
}

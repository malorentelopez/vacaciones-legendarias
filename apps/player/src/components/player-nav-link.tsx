"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { useEffect, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@repo/ui";
import { useTheme } from "@/components/theme-provider";
import { useReportNavPending } from "@/components/player-navigation";

function useNavPendingFeedback() {
  const { pending } = useLinkStatus();
  const reportPending = useReportNavPending();

  useEffect(() => {
    reportPending(pending);
    return () => reportPending(false);
  }, [pending, reportPending]);

  return pending;
}

function NavLinkContent({
  icon: Icon,
  label,
  active,
  compact,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  compact?: boolean;
}) {
  const pending = useNavPendingFeedback();

  if (compact) {
    return (
      <>
        <Icon
          className={cn(
            "h-5 w-5 transition-opacity",
            pending && "opacity-40",
            active && !pending && "text-[var(--theme-accent)]"
          )}
        />
        <span
          className={cn(
            "transition-opacity",
            pending && "opacity-40",
            active && !pending ? "text-[var(--theme-accent)]" : "text-slate-400"
          )}
        >
          {label}
        </span>
        {pending ? (
          <span
            className="absolute inset-x-2 top-1 h-0.5 rounded-full bg-[var(--theme-accent)]"
            aria-hidden
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      <Icon className={cn("h-4 w-4 shrink-0", pending && "opacity-50")} />
      <span className={cn(pending && "opacity-70")}>{label}</span>
      {pending ? (
        <span
          className="ml-auto h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[var(--theme-accent)]"
          aria-hidden
        />
      ) : null}
    </>
  );
}

export function PlayerNavLink({
  href,
  icon,
  label,
  active,
  onClick,
  compact,
  className,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
}) {
  const theme = useTheme();

  return (
    <Link
      href={href}
      prefetch
      onClick={onClick}
      className={cn(
        "touch-manipulation transition-colors active:opacity-80",
        compact
          ? "relative flex flex-col items-center gap-1 px-2 py-1.5 text-[10px] font-medium"
          : "flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm",
        !compact && (active ? "text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"),
        className
      )}
      style={!compact && active ? { backgroundColor: theme.colors.navActive } : undefined}
      aria-current={active ? "page" : undefined}
    >
      <NavLinkContent icon={icon} label={label} active={active} compact={compact} />
    </Link>
  );
}

export function PlayerDrawerNavLink({
  href,
  icon: Icon,
  label,
  active,
  onClick,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  const theme = useTheme();

  return (
    <Link
      href={href}
      prefetch
      onClick={onClick}
      className={cn(
        "touch-manipulation flex items-center gap-2 rounded-xl px-3 py-3 text-sm transition-colors active:opacity-80",
        active ? "text-white" : "text-slate-300 hover:bg-slate-800"
      )}
      style={active ? { backgroundColor: theme.colors.navActive } : undefined}
      aria-current={active ? "page" : undefined}
    >
      <DrawerNavLinkContent icon={Icon} label={label} />
    </Link>
  );
}

function DrawerNavLinkContent({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  const pending = useNavPendingFeedback();

  return (
    <>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/80">
        <Icon className={cn("h-4 w-4", pending && "opacity-60")} />
      </span>
      <span className={cn(pending && "opacity-70")}>{label}</span>
    </>
  );
}

export function PlayerMenuNavLink({
  href,
  icon: Icon,
  label,
  active,
  onClick,
  children,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick?: () => void;
  children?: ReactNode;
}) {
  const theme = useTheme();

  return (
    <Link
      href={href}
      prefetch
      onClick={onClick}
      className={cn(
        "touch-manipulation flex items-center gap-2 px-3 py-2 text-sm transition-colors active:opacity-80",
        active ? "text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
      )}
      style={active ? { backgroundColor: theme.colors.navActive } : undefined}
      aria-current={active ? "page" : undefined}
    >
      <MenuNavLinkContent icon={Icon} label={label}>
        {children}
      </MenuNavLinkContent>
    </Link>
  );
}

function MenuNavLinkContent({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children?: ReactNode;
}) {
  const pending = useNavPendingFeedback();

  return (
    <>
      <Icon className={cn("h-4 w-4 shrink-0", pending && "opacity-50")} />
      <span className={cn(pending && "opacity-70")}>{children ?? label}</span>
    </>
  );
}

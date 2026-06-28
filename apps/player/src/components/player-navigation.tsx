"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@repo/ui";

const NavPendingContext = createContext<(pending: boolean) => void>(() => {});

export function useReportNavPending() {
  return useContext(NavPendingContext);
}

function NavigationProgressBar({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden opacity-0 transition-opacity duration-150",
        active && "player-nav-progress-active"
      )}
    >
      <div className="player-nav-progress-bar h-full w-full origin-left bg-[var(--theme-accent)]" />
    </div>
  );
}

export function PlayerNavigationProvider({ children }: { children: ReactNode }) {
  const pendingCount = useRef(0);
  const [active, setActive] = useState(false);

  const reportPending = useCallback((pending: boolean) => {
    pendingCount.current = Math.max(0, pendingCount.current + (pending ? 1 : -1));
    setActive(pendingCount.current > 0);
  }, []);

  return (
    <NavPendingContext.Provider value={reportPending}>
      <NavigationProgressBar active={active} />
      {children}
    </NavPendingContext.Provider>
  );
}

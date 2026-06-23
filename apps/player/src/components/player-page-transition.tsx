"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui";

const TRANSITION_PATHS = new Set(["/", "/ruta"]);

type TransitionDirection = "to-route" | "to-camp" | null;

function getDirection(from: string, to: string): TransitionDirection {
  if (from === "/" && to === "/ruta") return "to-route";
  if (from === "/ruta" && to === "/") return "to-camp";
  return null;
}

export function PlayerPageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const [direction, setDirection] = useState<TransitionDirection>(null);

  useEffect(() => {
    const from = previousPath.current;
    const to = pathname;

    if (TRANSITION_PATHS.has(from) && TRANSITION_PATHS.has(to) && from !== to) {
      setDirection(getDirection(from, to));
      const timer = window.setTimeout(() => setDirection(null), 180);
      previousPath.current = to;
      return () => window.clearTimeout(timer);
    }

    previousPath.current = to;
    setDirection(null);
  }, [pathname]);

  const shouldAnimate = TRANSITION_PATHS.has(pathname);

  return (
    <div
      key={shouldAnimate ? pathname : "player-page"}
      className={cn(
        shouldAnimate && "player-page-transition",
        direction === "to-route" && "player-page-to-route",
        direction === "to-camp" && "player-page-to-camp"
      )}
    >
      {children}
    </div>
  );
}

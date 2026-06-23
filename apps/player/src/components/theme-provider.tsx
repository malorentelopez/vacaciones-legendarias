"use client";

import { createContext, useContext, useEffect, useState, type CSSProperties } from "react";
import type { ThemeConfig } from "@repo/domain/client";
import { getTheme } from "@repo/domain/client";

const ThemeContext = createContext<ThemeConfig>(getTheme("adventure"));
const ThemeKeyContext = createContext<{
  themeKey: string;
  setThemeKey: (key: string) => void;
} | null>(null);

function themeVars(theme: ThemeConfig): CSSProperties {
  return {
    "--theme-primary": theme.colors.primary,
    "--theme-secondary": theme.colors.secondary,
    "--theme-accent": theme.colors.accent,
    "--theme-bg-from": theme.colors.bgFrom,
    "--theme-bg-via": theme.colors.bgVia,
    "--theme-bg-to": theme.colors.bgTo,
    "--theme-nav-active": theme.colors.navActive,
    "--theme-heading": theme.colors.heading,
  } as React.CSSProperties;
}

export function PlayerThemeShell({
  initialThemeKey,
  children,
}: {
  initialThemeKey: string;
  children: React.ReactNode;
}) {
  const [themeKey, setThemeKey] = useState(initialThemeKey);

  useEffect(() => {
    setThemeKey(initialThemeKey);
  }, [initialThemeKey]);

  const theme = getTheme(themeKey);

  return (
    <ThemeKeyContext.Provider value={{ themeKey, setThemeKey }}>
      <ThemeContext.Provider value={theme}>
        <div
          data-player-theme={theme.key}
          style={themeVars(theme)}
          className="min-h-screen bg-gradient-to-b from-[var(--theme-bg-from)] via-[var(--theme-bg-via)]/20 to-[var(--theme-bg-to)]"
        >
          {children}
        </div>
      </ThemeContext.Provider>
    </ThemeKeyContext.Provider>
  );
}

/** Preview a theme across the player shell (e.g. while picking a mundo). */
export function useThemePreview() {
  return useContext(ThemeKeyContext)?.setThemeKey;
}

export function ThemeScope({
  themeKey,
  children,
  className,
}: {
  themeKey: string;
  children: React.ReactNode;
  className?: string;
}) {
  const theme = getTheme(themeKey);

  return (
    <ThemeContext.Provider value={theme}>
      <div data-player-theme={theme.key} style={themeVars(theme)} className={className}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

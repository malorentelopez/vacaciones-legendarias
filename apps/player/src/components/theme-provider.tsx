"use client";

import { createContext, useContext } from "react";
import type { ThemeConfig } from "@repo/domain";
import { getTheme } from "@repo/domain";

const ThemeContext = createContext<ThemeConfig>(getTheme("adventure"));

export function ThemeProvider({
  themeKey,
  children,
}: {
  themeKey: string;
  children: React.ReactNode;
}) {
  const theme = getTheme(themeKey);

  return (
    <ThemeContext.Provider value={theme}>
      <div
        style={
          {
            "--theme-primary": theme.colors.primary,
            "--theme-secondary": theme.colors.secondary,
            "--theme-accent": theme.colors.accent,
            "--theme-bg-from": theme.colors.bgFrom,
            "--theme-bg-via": theme.colors.bgVia,
            "--theme-bg-to": theme.colors.bgTo,
            "--theme-nav-active": theme.colors.navActive,
            "--theme-heading": theme.colors.heading,
          } as React.CSSProperties
        }
        className="min-h-screen bg-gradient-to-b from-[var(--theme-bg-from)] via-[var(--theme-bg-via)]/20 to-[var(--theme-bg-to)]"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

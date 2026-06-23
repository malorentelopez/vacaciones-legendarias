import type { CSSProperties } from "react";
import type { ThemeConfig } from "@repo/domain/client";

export function themeProgressBar(theme: ThemeConfig): CSSProperties {
  return {
    background: `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.secondary})`,
  };
}

export function themeGlow(theme: ThemeConfig, opacity = 0.7): string {
  const hex = theme.colors.primary.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `0 0 10px rgba(${r}, ${g}, ${b}, ${opacity})`;
}

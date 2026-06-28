"use client";

import { useEffect } from "react";
import { useThemePreview } from "@/components/theme-provider";

export function ThemeSync({ themeKey }: { themeKey: string }) {
  const setThemeKey = useThemePreview();

  useEffect(() => {
    setThemeKey?.(themeKey);
  }, [setThemeKey, themeKey]);

  return null;
}

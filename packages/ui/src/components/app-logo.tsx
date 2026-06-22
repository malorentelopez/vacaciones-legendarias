"use client";

import { cn } from "../lib/utils";

export type LogoVariant = "full" | "icon";
export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AppLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  priority?: boolean;
}

const iconSizes: Record<LogoSize, string> = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-20 w-20",
};

const fullHeights: Record<LogoSize, string> = {
  xs: "h-6",
  sm: "h-8",
  md: "h-10",
  lg: "h-14",
  xl: "h-20",
};

export function AppLogo({ variant = "full", size = "md", className, priority }: AppLogoProps) {
  const src = variant === "icon" ? "/logo-icon.png" : "/logo-full.png";
  const alt = "Verano Legendario";

  if (variant === "icon") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn("object-contain", iconSizes[size], className)}
        draggable={false}
        {...(priority ? { fetchPriority: "high" as const } : {})}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("w-auto object-contain", fullHeights[size], className)}
      draggable={false}
      {...(priority ? { fetchPriority: "high" as const } : {})}
    />
  );
}

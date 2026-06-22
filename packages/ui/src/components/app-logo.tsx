"use client";

import { cn } from "../lib/utils";

export type LogoVariant = "full" | "icon";
export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface AppLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  /** Stretch full logo to container width (e.g. sidebar) */
  fullWidth?: boolean;
  className?: string;
  priority?: boolean;
}

const iconSizes: Record<LogoSize, string> = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
  "2xl": "h-20 w-20",
};

const fullHeights: Record<LogoSize, string> = {
  xs: "h-8",
  sm: "h-10",
  md: "h-14",
  lg: "h-20",
  xl: "h-28",
  "2xl": "h-36",
};

export function AppLogo({ variant = "full", size = "md", fullWidth, className, priority }: AppLogoProps) {
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
      className={cn(
        "object-contain",
        fullWidth ? "h-auto w-full" : cn("w-auto max-w-full", fullHeights[size]),
        className
      )}
      draggable={false}
      {...(priority ? { fetchPriority: "high" as const } : {})}
    />
  );
}

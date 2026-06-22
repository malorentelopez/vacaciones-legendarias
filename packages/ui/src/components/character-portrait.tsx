"use client";

import { cn } from "../lib/utils";

export type PortraitGender = "boy" | "girl";
export type PortraitSize = "sm" | "md" | "lg" | "xl";

interface CharacterPortraitProps {
  imageSrc: string;
  primaryColor?: string;
  secondaryColor?: string;
  alt?: string;
  size?: PortraitSize;
  className?: string;
}

const sizeMap: Record<PortraitSize, string> = {
  sm: "h-14 w-14",
  md: "h-20 w-20",
  lg: "h-28 w-28",
  xl: "h-36 w-36",
};

export function CharacterPortrait({
  imageSrc,
  alt = "Avatar del personaje",
  primaryColor = "#8b5cf6",
  secondaryColor = "#22c55e",
  size = "md",
  className,
}: CharacterPortraitProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl ring-1 ring-white/10",
        sizeMap[size],
        className
      )}
      style={{
        background: `linear-gradient(160deg, ${primaryColor}35 0%, ${secondaryColor}25 100%)`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={alt}
        className="h-full w-full object-cover object-top"
        loading="lazy"
        draggable={false}
      />
    </div>
  );
}

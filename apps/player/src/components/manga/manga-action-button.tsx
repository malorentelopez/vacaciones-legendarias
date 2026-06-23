"use client";

import { cn, Button } from "@repo/ui";
import type { ComponentProps } from "react";

export function MangaActionButton({ className, children, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      className={cn(
        "manga-action-btn font-display text-xs uppercase tracking-wide sm:text-sm",
        className
      )}
    >
      {children}
    </Button>
  );
}

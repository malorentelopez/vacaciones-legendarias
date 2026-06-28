"use client";

import { cn, AppLogo, mobileBottomNavPaddingStyle } from "@repo/ui";

export function PlayerNavSkeleton() {
  return (
    <>
      <nav
        aria-hidden
        className="theme-nav-border sticky top-0 z-50 hidden animate-pulse border-b bg-slate-900/80 backdrop-blur-lg md:block"
      >
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-2">
          <AppLogo variant="icon" size="sm" />
          <div className="flex flex-1 gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-9 w-20 rounded-xl bg-slate-800" />
            ))}
          </div>
          <div className="h-8 w-16 rounded-lg bg-slate-800" />
        </div>
      </nav>
      <div aria-hidden className="theme-nav-border hidden animate-pulse border-b md:block">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <div className="h-12 w-12 rounded-full bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-slate-800" />
            <div className="h-2 w-full rounded-full bg-slate-800" />
          </div>
        </div>
      </div>
      <header
        aria-hidden
        className="theme-nav-border relative flex animate-pulse items-center justify-center border-b bg-slate-900/60 px-4 py-3 backdrop-blur-lg md:hidden"
      >
        <div className="h-8 w-32 rounded-lg bg-slate-800" />
        <div className="absolute right-4 top-1/2 h-7 w-14 -translate-y-1/2 rounded-lg bg-slate-800" />
      </header>
      <div aria-hidden className="theme-nav-border animate-pulse border-b md:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="h-10 w-10 rounded-full bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 rounded bg-slate-800" />
            <div className="h-2 w-full rounded-full bg-slate-800" />
          </div>
        </div>
      </div>
      <nav
        aria-hidden
        className="theme-nav-border fixed inset-x-0 bottom-0 z-50 animate-pulse border-t bg-slate-900/80 backdrop-blur-lg md:hidden"
      >
        <div
          className="mx-auto grid max-w-4xl grid-cols-4 px-2 pt-1"
          style={mobileBottomNavPaddingStyle}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-1 py-1.5">
              <div className="h-5 w-5 rounded bg-slate-800" />
              <div className="h-2 w-10 rounded bg-slate-800" />
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}

export function PlayerPageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse space-y-6", className)} aria-hidden>
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-slate-800" />
        <div className="h-4 w-64 max-w-full rounded bg-slate-800/80" />
      </div>
      <div className="h-40 rounded-2xl bg-slate-800" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-24 rounded-xl bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

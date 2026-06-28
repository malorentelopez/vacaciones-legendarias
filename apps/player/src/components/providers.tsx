"use client";

import { SerwistProvider } from "@serwist/next/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SerwistProvider
      swUrl="/sw.js"
      register={process.env.NODE_ENV === "production"}
      reloadOnOnline
      cacheOnNavigation={false}
    >
      {children}
    </SerwistProvider>
  );
}

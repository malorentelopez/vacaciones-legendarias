"use client";

import { Button } from "@repo/ui";

export function RetryButton() {
  return (
    <Button type="button" className="w-full" onClick={() => window.location.reload()}>
      Reintentar
    </Button>
  );
}

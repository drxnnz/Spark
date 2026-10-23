"use client";

import { Button } from "@/components/ui/button";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-[60dvh] place-items-center p-6 text-center">
      <div className="space-y-3">
        <h2 className="font-display text-2xl">Something went wrong</h2>
        <p className="text-sm text-ink/60">Please try again.</p>
        <Button onClick={reset}>Retry</Button>
      </div>
    </div>
  );
}

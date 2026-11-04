"use client";

import * as React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Global Error caught:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
        <div className="flex max-w-md flex-col items-center text-center space-y-4 p-8 rounded-2xl border border-border bg-card shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight">
            Something went wrong
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Miru encountered an unexpected issue while loading your academic workspace.
          </p>
          <div className="pt-2">
            <Button onClick={() => reset()} size="sm" className="gap-2">
              <RotateCcw className="h-4 w-4" /> Try again
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}


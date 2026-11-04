"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("App Error caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-foreground">
      <div className="flex max-w-md flex-col items-center text-center space-y-4 p-8 rounded-2xl border border-border bg-card shadow-lg">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="font-serif text-2xl font-bold tracking-tight">
          Academic Workspace Notice
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          There was an error loading this workspace view. Your data remains safe and synchronized.
        </p>
        <div className="flex items-center gap-2 pt-2">
          <Button onClick={() => reset()} variant="outline" size="sm" className="gap-2">
            <RotateCcw className="h-4 w-4" /> Try again
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard" className="gap-2">
              <Home className="h-4 w-4" /> Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}


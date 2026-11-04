import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-foreground">
      <div className="flex max-w-md flex-col items-center text-center space-y-4 p-8 rounded-2xl border border-border bg-card shadow-lg">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Compass className="h-6 w-6" />
        </div>
        <h2 className="font-serif text-2xl font-bold tracking-tight">
          Page Not Found
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The course, resource, or workspace page you are looking for does not exist or has been relocated.
        </p>
        <div className="pt-2">
          <Button size="sm" asChild>
            <Link href="/dashboard" className="gap-2">
              <Home className="h-4 w-4" /> Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}


"use client";

import * as React from "react";
import { Search, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { UserProfileMenu } from "@/components/layout/user-profile-menu";

interface HeaderProps {
  onOpenMobileNav: () => void;
}

export function Header({ onOpenMobileNav }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-20 w-full items-center justify-between border-b border-border bg-card/80 px-4 md:px-8 backdrop-blur-md">
      {/* Left: Mobile trigger & breadcrumb / current term indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border md:hidden text-foreground hover:bg-muted cursor-pointer"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <Badge variant="subtle" className="hidden sm:inline-flex gap-1.5 font-medium py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            AY 2025–2026 • Spring Semester
          </Badge>
        </div>
      </div>

      {/* Middle: Mindful Global Search Bar */}
      <div className="hidden max-w-md flex-1 md:flex px-6">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search courses, syllabi, notes, formula sheets..."
            className="h-10 w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 text-xs font-normal text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions, Theme, and Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        <div className="hidden h-5 w-[1px] bg-border sm:block" />

        {/* User Profile / Google Sign-in */}
        <UserProfileMenu />
      </div>
    </header>
  );
}

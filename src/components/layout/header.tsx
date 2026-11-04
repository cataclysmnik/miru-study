"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { UserProfileMenu } from "@/components/layout/user-profile-menu";
import { GlobalSearch } from "@/components/layout/global-search";

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

      {/* Middle: Functional Mindful Global Search Bar */}
      <div className="hidden max-w-md flex-1 md:flex px-6">
        <GlobalSearch />
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

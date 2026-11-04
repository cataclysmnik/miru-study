"use client";

import * as React from "react";
import { LogIn, LogOut, Sparkles, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";

export function UserProfileMenu() {
  const { user, profile, signInWithGoogle, signOut } = useAuth();

  if (!user) {
    return (
      <Button
        variant="default"
        size="sm"
        onClick={() => signInWithGoogle()}
        className="gap-2 text-xs font-medium"
      >
        <LogIn className="h-3.5 w-3.5" />
        <span>Sign in with Google</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2.5 rounded-full border border-border bg-background/50 py-1 pl-1.5 pr-3">
        <Avatar className="h-7 w-7 border-0">
          {profile?.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />}
          <AvatarFallback>
            {profile?.fullName?.substring(0, 2).toUpperCase() || "ME"}
          </AvatarFallback>
        </Avatar>
        <div className="hidden flex-col text-left text-xs md:flex">
          <span className="font-semibold text-foreground leading-tight">
            {profile?.fullName}
          </span>
          <span className="text-[10px] text-muted-foreground">{profile?.academicRole}</span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut()}
        className="h-8 text-xs text-muted-foreground hover:text-foreground"
        title="Sign Out"
      >
        <LogOut className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}


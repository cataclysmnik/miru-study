"use client";

import * as React from "react";
import {
  User,
  Shield,
  Download,
  Trash2,
  Cpu,
  Palette,
  WifiOff,
  CheckCircle2,
  Save,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-provider";
import { useAcademic } from "@/components/academic-provider";
import { useAI } from "@/components/ai-provider";
import { BYOKSettingsCard } from "@/components/ai/byok-settings-card";

export default function SettingsPage() {
  const { profile } = useAuth();
  const { courses, years } = useAcademic();
  const { resources } = useAI();

  const [name, setName] = React.useState(profile?.fullName || "Aoi Takahashi");
  const [role, setRole] = React.useState(profile?.academicRole || "Undergraduate Student");
  const [institution, setInstitution] = React.useState(profile?.institution || "Faculty of Computer Science");
  const [saved, setSaved] = React.useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExportWorkspace = () => {
    const backupData = {
      user: profile,
      exportedAt: new Date().toISOString(),
      academicYears: years,
      courses: courses,
      resources: resources,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `miru-academic-workspace-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10 pb-20 max-w-4xl mx-auto">
      {/* Settings Header */}
      <div className="border-b border-border/60 pb-6">
        <span className="text-xs font-semibold tracking-wider uppercase text-primary">
          Preferences & Data Sovereignty
        </span>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground mt-1">
          Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your student identity, AI engine credentials, offline synchronization, and full workspace data exports.
        </p>
      </div>

      <div className="space-y-8">
        {/* 1. Academic Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Student Academic Identity</CardTitle>
                <CardDescription>
                  Your profile details are private and scoped exclusively to your personal workspace.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Academic Role / Level
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Institution / Department (Optional)
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Department of Computer Science"
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm" className="gap-1.5">
                  <Save className="h-3.5 w-3.5" />
                  <span>{saved ? "Profile Updated" : "Save Changes"}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 2. AI Engine & BYOK Management */}
        <BYOKSettingsCard />

        {/* 3. Offline & Synchronization Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-foreground">
                <WifiOff className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Offline Capabilities & PWA</CardTitle>
                <CardDescription>
                  Miru caches course structures, syllabi, notes, and quiz sets in IndexedDB for continuous study without internet access.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-xl border border-border/80 bg-background/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-foreground">Offline Storage: </span>
                <span className="text-primary font-medium">Ready & Indexed</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {courses.length} courses, {resources.length} documents cached locally.
                </p>
              </div>
              <Badge variant="matcha" className="gap-1 text-[10px]">
                <CheckCircle2 className="h-3 w-3" /> PWA Sync Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 4. Data Export & Sovereignty */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-foreground">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Data Sovereignty & Workspace Backup</CardTitle>
                <CardDescription>
                  Download an unencumbered JSON backup of your entire academic hierarchy, syllabi, and notes.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
              You own all academic content in Miru. Export your complete workspace at any time to preserve study records or transfer to other tools.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportWorkspace}
              className="gap-2 text-xs shrink-0"
            >
              <Download className="h-4 w-4" />
              <span>Export Workspace JSON</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


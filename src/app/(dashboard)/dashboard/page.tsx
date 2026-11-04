"use client";

import * as React from "react";
import Link from "next/link";
import {
  PlusCircle,
  FileUp,
  Sparkles,
  BookOpen,
  CalendarCheck2,
  HelpCircle,
  ArrowRight,
  Clock,
  CheckCircle2,
  FileText,
  Bookmark,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-provider";
import { useAcademic } from "@/components/academic-provider";
import { useAI } from "@/components/ai-provider";

export default function DashboardPage() {
  const { profile } = useAuth();
  const { courses, activeSemester, isLoading: academicLoading } = useAcademic();
  const { resources, isLoading: aiLoading } = useAI();

  return (
    <div className="space-y-10 pb-12">
      {/* Editorial Welcome Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between border-b border-border/60 pb-6">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-primary">
            Mindful Learning Environment
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-1">
            Good morning, {profile?.fullName?.split(" ")[0] || "Scholar"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            {activeSemester?.name || "Current Academic Workspace"} is active. Focus on your syllabus modules or review your generated notes.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2 md:pt-0">
          <Link href="/courses">
            <Button variant="outline" size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              New Course
            </Button>
          </Link>
          <Link href="/ai-studio">
            <Button size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Notes
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Action Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: "Create Course", icon: PlusCircle, href: "/courses" },
          { label: "Upload Material", icon: FileUp, href: "/courses" },
          { label: "Add Syllabus", icon: BookOpen, href: "/courses" },
          { label: "AI Studio", icon: Sparkles, href: "/ai-studio" },
          { label: "Resource Library", icon: HelpCircle, href: "/resources" },
          { label: "Study Planner", icon: CalendarCheck2, href: "/planner" },
        ].map((action, i) => {
          const Icon = action.icon;
          return (
            <Link
              key={i}
              href={action.href}
              className="group flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card/60 hover:bg-card hover:border-primary/50 text-center transition-all shadow-xs"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-2">
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Grid: Courses & Planner Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Courses & Syllabus Coverage */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Active Courses
              </h2>
              <p className="text-xs text-muted-foreground">
                Live courses linked to your Supabase academic workspace
              </p>
            </div>
            <Link href="/courses" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card/40 space-y-3">
              <BookOpen className="h-8 w-8 text-muted-foreground mx-auto" />
              <h4 className="text-sm font-semibold text-foreground">No courses created yet</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Create your first academic course in the Courses Hub to begin uploading syllabi and study materials.
              </p>
              <Link href="/courses">
                <Button size="sm" className="mt-2">
                  Create First Course
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <Card key={course.id} className="group hover:border-primary/40 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="subtle" className="font-mono text-[10px]">
                        {course.code || "COURSE"}
                      </Badge>
                      <span className="text-xs font-semibold text-primary">
                        {course.progressPercent}%
                      </span>
                    </div>
                    <CardTitle className="text-base group-hover:text-primary transition-colors mt-2">
                      {course.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-1">
                      {course.instructorName || "No instructor assigned"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Syllabus Covered</span>
                        <span>
                          {course.syllabus.modules.length} modules
                        </span>
                      </div>
                      <Progress value={course.progressPercent} className="h-1.5" />
                    </div>
                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                      <Link
                        href={`/courses/${course.id}`}
                        className="font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        Workspace <ArrowRight className="h-3 w-3" />
                      </Link>
                      <Link
                        href={`/courses/${course.id}?tab=ai-studio`}
                        className="text-primary hover:underline flex items-center gap-1 font-medium"
                      >
                        <Sparkles className="h-3 w-3" /> Chatbot
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Recently Generated Academic Resources */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Your Academic Resources ({resources.length})
              </h2>
              <Link href="/resources" className="text-xs font-medium text-primary hover:underline">
                Resource Library
              </Link>
            </div>

            {resources.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground border border-border rounded-xl bg-card/30">
                No resources generated yet. Visit the AI Studio to synthesize your first notes!
              </div>
            ) : (
              <div className="space-y-2.5">
                {resources.slice(0, 4).map((res) => (
                  <div
                    key={res.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card hover:border-border/80 transition-all text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{res.title}</span>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                            {res.courseCode}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-[11px] mt-0.5">
                          <span>{res.resourceType.replace("_", " ")}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {res.createdAt}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/resources/${res.id}`}>Open</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Mindful Academic Focus */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Workspace Statistics</CardTitle>
              <CardDescription>Live database counts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-background/50 border border-border/60">
                <span className="text-muted-foreground">Active Courses:</span>
                <span className="font-bold text-foreground">{courses.length}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-background/50 border border-border/60">
                <span className="text-muted-foreground">Saved Resources:</span>
                <span className="font-bold text-foreground">{resources.length}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-background/50 border border-border/60">
                <span className="text-muted-foreground">Active Term:</span>
                <span className="font-semibold text-primary">{activeSemester?.name || "Term"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Japanese Wabi-Sabi Mindful Study Thought */}
          <div className="rounded-xl border border-primary/25 bg-primary/5 p-5 text-xs space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Bookmark className="h-4 w-4" />
              <span>Academic Focus</span>
            </div>
            <p className="text-muted-foreground italic leading-relaxed">
              &quot;Learning is like the tea ceremony: patience, deliberate attention to detail, and reverence for deep fundamentals over hurried memorisation.&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

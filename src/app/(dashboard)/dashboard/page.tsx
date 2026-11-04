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
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-provider";
import { ACTIVE_COURSES, UPCOMING_TASKS, RECENT_RESOURCES } from "@/lib/mock-academic-data";

export default function DashboardPage() {
  const { profile } = useAuth();

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
            Spring Semester is 62% in progress. Focus today on your scheduled algorithm topics or review generated flashcards.
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
          { label: "Practice Quiz", icon: HelpCircle, href: "/resources" },
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
                Syllabus progress based on verified module topics
              </p>
            </div>
            <Link href="/courses" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ACTIVE_COURSES.map((course) => (
              <Card key={course.id} className="group hover:border-primary/40 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="subtle" className="font-mono text-[10px]">
                      {course.code}
                    </Badge>
                    <span className="text-xs font-semibold text-primary">
                      {course.progressPercent}%
                    </span>
                  </div>
                  <CardTitle className="text-base group-hover:text-primary transition-colors mt-2">
                    {course.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-1">
                    {course.instructor}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Syllabus Covered</span>
                      <span>
                        {course.completedModules} of {course.totalModules} modules
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

          {/* Recently Generated Academic Resources */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Recent Resources
              </h2>
              <Link href="/resources" className="text-xs font-medium text-primary hover:underline">
                Resource Library
              </Link>
            </div>

            <div className="space-y-2.5">
              {RECENT_RESOURCES.map((res) => (
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
                        <span>{res.type}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {res.updatedAt}
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
          </div>
        </div>

        {/* Right 1 Col: Upcoming Deadlines & Mindful Habits */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Study Schedule</CardTitle>
                <Link href="/planner" className="text-xs font-medium text-primary hover:underline">
                  Planner
                </Link>
              </div>
              <CardDescription>Targeted syllabus milestones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {UPCOMING_TASKS.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/70 bg-background/50 text-xs"
                >
                  <div className="pt-0.5">
                    {task.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-muted-foreground/60" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={task.isExam ? "destructive" : "secondary"}
                        className="text-[9px] py-0 px-1.5 font-mono"
                      >
                        {task.courseCode}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{task.dueDate}</span>
                    </div>
                    <p
                      className={`text-xs font-medium ${
                        task.isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </p>
                  </div>
                </div>
              ))}
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


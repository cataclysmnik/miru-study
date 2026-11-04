"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  Sparkles,
  HelpCircle,
  BarChart3,
  Layers,
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAcademic } from "@/components/academic-provider";
import { SyllabusTree } from "@/components/syllabus/syllabus-tree";
import { MaterialsManager } from "@/components/materials/materials-manager";
import { CourseChatbot } from "@/components/ai/course-chatbot";

export default function CourseWorkspacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { courses } = useAcademic();

  const courseId = params.id as string;
  const course = courses.find((c) => c.id === courseId) || courses[0];

  const currentTab = searchParams.get("tab") || "overview";

  const handleTabChange = (value: string) => {
    router.push(`/courses/${courseId}?tab=${value}`);
  };

  if (!course) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">Course Not Found</h2>
        <Link href="/courses">
          <Button variant="outline">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  const allTopics = course.syllabus.modules.flatMap((m) => m.topics);
  const completedTopics = allTopics.filter((t) => t.status === "completed").length;
  const inProgressTopics = allTopics.filter((t) => t.status === "in_progress").length;

  return (
    <div className="space-y-8 pb-16">
      {/* Back button & Course Workspace Header */}
      <div className="space-y-4 border-b border-border/60 pb-6">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to My Courses
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="subtle" className="font-mono text-xs">
                {course.code}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {course.semesterName}
              </Badge>
              {course.credits && (
                <Badge variant="secondary" className="text-xs">
                  {course.credits} Credits
                </Badge>
              )}
            </div>

            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
              {course.name}
            </h1>

            {course.instructorName && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" />
                Instructor: {course.instructorName}
              </p>
            )}
          </div>

          {/* Quick syllabus completion meter */}
          <div className="flex flex-col items-start sm:items-end gap-1.5 bg-card/60 border border-border p-3.5 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">
                Syllabus Mastery
              </span>
              <span className="text-sm font-bold text-primary">
                {course.progressPercent}%
              </span>
            </div>
            <Progress value={course.progressPercent} className="w-36 h-2" />
            <span className="text-[10px] text-muted-foreground">
              {completedTopics} of {allTopics.length} topics verified
            </span>
          </div>
        </div>
      </div>

      {/* Course Workspace Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full flex justify-start overflow-x-auto h-12 p-1.5 gap-1.5">
          <TabsTrigger value="overview" className="gap-2">
            <BookOpen className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="syllabus" className="gap-2">
            <Layers className="h-4 w-4" /> Syllabus ({course.syllabus.modules.length})
          </TabsTrigger>
          <TabsTrigger value="materials" className="gap-2">
            <FileText className="h-4 w-4" /> Materials ({course.materials.length})
          </TabsTrigger>
          <TabsTrigger value="ai-studio" className="gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> AI Assistant
          </TabsTrigger>
          <TabsTrigger value="questions" className="gap-2">
            <HelpCircle className="h-4 w-4" /> Question Bank
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-2">
            <BarChart3 className="h-4 w-4" /> Progress
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6 pt-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Course Objectives & Scope</CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border bg-background/50 space-y-1">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Curriculum Units
                </span>
                <p className="text-2xl font-bold text-foreground">
                  {course.syllabus.modules.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Structured modules with subtopics
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background/50 space-y-1">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Study Materials
                </span>
                <p className="text-2xl font-bold text-foreground">
                  {course.materials.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Indexed slides and textbooks
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background/50 space-y-1">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Mastered Topics
                </span>
                <p className="text-2xl font-bold text-primary">
                  {completedTopics} / {allTopics.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {inProgressTopics} topics currently in review
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Syllabus Overview Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Modules in this Course
              </h3>
              <Button
                variant="link"
                size="sm"
                className="text-xs text-primary"
                onClick={() => handleTabChange("syllabus")}
              >
                Open Full Tree
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {course.syllabus.modules.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-xl border border-border bg-card space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground">
                      {m.title}
                    </span>
                    {m.hoursOrWeightage && (
                      <Badge variant="outline" className="text-[10px] py-0">
                        {m.hoursOrWeightage}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {m.description || "No module description."}
                  </p>
                  <span className="text-[10px] text-primary font-medium">
                    {m.topics.length} topics mapped
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Syllabus Tree */}
        <TabsContent value="syllabus" className="pt-2">
          <SyllabusTree courseId={course.id} syllabus={course.syllabus} />
        </TabsContent>

        {/* Tab 3: Materials Manager */}
        <TabsContent value="materials" className="pt-2">
          <MaterialsManager
            courseId={course.id}
            materials={course.materials}
            modules={course.syllabus.modules}
          />
        </TabsContent>

        {/* Tab 4: AI Assistant */}
        <TabsContent value="ai-studio" className="pt-2">
          <CourseChatbot course={course} />
        </TabsContent>

        {/* Tab 5: Question Bank */}
        <TabsContent value="questions" className="space-y-4 pt-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Course Question Bank</CardTitle>
                  <CardDescription>
                    Generated MCQs, short answers, and flashcards derived from {course.code} materials.
                  </CardDescription>
                </div>
                <Button size="sm" className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Generate Questions
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px]">
                    MCQ • Dynamic Programming
                  </Badge>
                  <Badge variant="matcha" className="text-[10px]">
                    Verified Source
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-foreground">
                  What gives the 0/1 Knapsack problem dynamic programming approach a pseudo-polynomial time complexity rather than strictly polynomial?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-lg border border-primary/50 bg-primary/10 text-primary font-medium">
                    A) Running time depends on numeric magnitude of capacity W, not binary input length. (Correct)
                  </div>
                  <div className="p-2 rounded-lg border border-border bg-background/50 text-muted-foreground">
                    B) Sorting items requires exponential space.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Progress */}
        <TabsContent value="progress" className="space-y-6 pt-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Curriculum Mastery Breakdown</CardTitle>
              <CardDescription>
                Detailed progress tracking per module and topic.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {course.syllabus.modules.map((m) => {
                const comp = m.topics.filter((t) => t.status === "completed").length;
                const pct =
                  m.topics.length > 0 ? Math.round((comp / m.topics.length) * 100) : 0;

                return (
                  <div key={m.id} className="space-y-1.5 p-3 rounded-xl border border-border bg-background/40">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-foreground">{m.title}</span>
                      <span className="font-semibold text-primary">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                    <span className="text-[10px] text-muted-foreground">
                      {comp} of {m.topics.length} topics verified
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


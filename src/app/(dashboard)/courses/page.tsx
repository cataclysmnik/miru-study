"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  ArrowRight,
  Sparkles,
  FileText,
  Layers,
  GraduationCap,
  SlidersHorizontal,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAcademic } from "@/components/academic-provider";
import { CreateCourseModal } from "@/components/courses/create-course-modal";

export default function CoursesPage() {
  const { courses, years } = useAcademic();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSemester, setSelectedSemester] = React.useState<string>("all");

  const currentYear = years.find((y) => y.isCurrent) || years[0];
  const semesters = currentYear ? currentYear.semesters : [];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSemester =
      selectedSemester === "all" || course.semesterId === selectedSemester;

    return matchesSearch && matchesSemester;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-primary">
            Curriculum Architecture
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground mt-1">
            My Courses
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your courses, syllabi, study materials, and syllabus-linked AI workspaces.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CreateCourseModal />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search courses by code, title, or topic keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="h-10 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">All Semesters</option>
            {semesters.map((sem) => (
              <option key={sem.id} value={sem.id}>
                {sem.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-border bg-card/40 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No courses found</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Try adjusting your search query or create a new course to begin tracking your syllabus and materials.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const totalModules = course.syllabus.modules.length;
            const completedTopics = course.syllabus.modules
              .flatMap((m) => m.topics)
              .filter((t) => t.status === "completed").length;
            const totalTopics = course.syllabus.modules.flatMap((m) => m.topics).length;

            return (
              <Card
                key={course.id}
                className="group flex flex-col justify-between hover:border-primary/50 transition-all shadow-xs"
              >
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: course.color }}
                        />
                        <Badge variant="subtle" className="font-mono text-[10px]">
                          {course.code || "COURSE"}
                        </Badge>
                      </div>
                      <span className="text-xs font-semibold text-primary">
                        {course.progressPercent}%
                      </span>
                    </div>

                    <CardTitle className="text-lg group-hover:text-primary transition-colors mt-2">
                      <Link href={`/courses/${course.id}`}>
                        {course.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {course.description || "No description provided."}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-1">
                    {course.instructorName && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <GraduationCap className="h-3.5 w-3.5" />
                        <span>{course.instructorName}</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Syllabus Covered</span>
                        <span>
                          {completedTopics} of {totalTopics} topics ({totalModules} modules)
                        </span>
                      </div>
                      <Progress value={course.progressPercent} className="h-1.5" />
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" /> {totalModules} modules
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" /> {course.materials.length} materials
                      </span>
                    </div>
                  </CardContent>
                </div>

                <div className="p-5 pt-0 border-t border-border/60 flex items-center justify-between text-xs mt-4">
                  <Link
                    href={`/courses/${course.id}`}
                    className="font-semibold text-foreground hover:text-primary flex items-center gap-1"
                  >
                    Enter Workspace <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/courses/${course.id}?tab=ai-studio`}
                    className="text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> AI Chat
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}


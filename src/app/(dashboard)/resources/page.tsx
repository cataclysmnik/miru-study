"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  FolderKanban,
  FileText,
  Bookmark,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAcademic } from "@/components/academic-provider";
import { useAI } from "@/components/ai-provider";
import { GenerationResourceType } from "@/types/ai";

export default function ResourcesPage() {
  const { courses } = useAcademic();
  const { resources } = useAI();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCourse, setSelectedCourse] = React.useState("all");
  const [selectedType, setSelectedType] = React.useState<string>("all");

  const filtered = resources.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse =
      selectedCourse === "all" || res.courseId === selectedCourse;
    const matchesType =
      selectedType === "all" || res.resourceType === selectedType;

    return matchesSearch && matchesCourse && matchesType;
  });

  return (
    <div className="space-y-8 pb-16">
      <div className="border-b border-border/60 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-primary">
            Curated Academic Knowledge
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground mt-1">
            Resource Library
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Central repository of all generated notes, cheat sheets, formula guides, and quizzes.
          </p>
        </div>

        <Link href="/ai-studio">
          <Button size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Generate New Resource</span>
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search resources by title, concept, or course code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="h-10 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-10 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">All Formats</option>
            <option value="detailed_notes">Detailed Notes</option>
            <option value="revision_notes">Revision Notes</option>
            <option value="cheat_sheet">Cheat Sheets</option>
            <option value="formula_sheet">Formula Sheets</option>
            <option value="mcq_quiz">MCQs</option>
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-3">
          <FolderKanban className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">No resources match your filters</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search criteria or create a fresh study document using the AI Studio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((res) => (
            <Card
              key={res.id}
              className="flex flex-col justify-between hover:border-primary/50 transition-all shadow-xs group"
            >
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="subtle" className="text-[10px] font-mono">
                      {res.courseCode}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {res.resourceType.replace("_", " ")}
                    </Badge>
                  </div>
                  <CardTitle className="text-base group-hover:text-primary transition-colors mt-2">
                    {res.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {res.moduleName || "General Course Scope"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {res.contentMarkdown.replace(/[#*`$]/g, "").slice(0, 140)}...
                  </p>
                </CardContent>
              </div>

              <div className="p-5 pt-0 border-t border-border/60 flex items-center justify-between text-xs mt-3">
                <span className="text-[11px] text-muted-foreground">
                  {res.createdAt}
                </span>
                <Link
                  href={`/resources/${res.id}`}
                  className="font-semibold text-foreground hover:text-primary flex items-center gap-1"
                >
                  Open Editor <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


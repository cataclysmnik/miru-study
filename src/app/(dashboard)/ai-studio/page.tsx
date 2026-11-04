"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  Layers,
  FileText,
  HelpCircle,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Bookmark,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAcademic } from "@/components/academic-provider";
import { useAI } from "@/components/ai-provider";
import { BYOKSettingsCard } from "@/components/ai/byok-settings-card";
import { GenerationResourceType } from "@/types/ai";

const RESOURCE_TYPES: Array<{
  type: GenerationResourceType;
  title: string;
  description: string;
  icon: any;
}> = [
  {
    type: "detailed_notes",
    title: "Detailed Study Notes",
    description: "In-depth explanations with derivations, theoretical rigor, and complete examples.",
    icon: FileText,
  },
  {
    type: "revision_notes",
    title: "Concise Revision Notes",
    description: "High-yield summaries designed for rapid pre-exam review.",
    icon: Zap,
  },
  {
    type: "mcq_quiz",
    title: "MCQ Mastery Bank",
    description: "Multiple choice questions with detailed explanations and citation proofs.",
    icon: HelpCircle,
  },
  {
    type: "cheat_sheet",
    title: "Cheat Sheet & Matrices",
    description: "Comparison tables, property checklists, and invariants in compact format.",
    icon: Bookmark,
  },
  {
    type: "formula_sheet",
    title: "Formula & Complexity Sheet",
    description: "Equations, recurrence bounds, Big-O theorems, and proof sketches.",
    icon: Sparkles,
  },
];

export default function AIStudioPage() {
  const { courses } = useAcademic();
  const { resources, generateResource } = useAI();

  const [selectedCourseId, setSelectedCourseId] = React.useState<string>(
    courses[0]?.id || ""
  );
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  const [selectedModuleId, setSelectedModuleId] = React.useState<string>("all");
  const [selectedTopicId, setSelectedTopicId] = React.useState<string>("all");
  const [selectedType, setSelectedType] = React.useState<GenerationResourceType>("detailed_notes");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [customInstructions, setCustomInstructions] = React.useState("");

  const modules = selectedCourse ? selectedCourse.syllabus.modules : [];
  const selectedModule = modules.find((m) => m.id === selectedModuleId);
  const topics = selectedModule ? selectedModule.topics : [];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || isGenerating) return;

    setIsGenerating(true);

    try {
      const topicObj = topics.find((t) => t.id === selectedTopicId);

      await generateResource({
        courseId: selectedCourse.id,
        courseCode: selectedCourse.code,
        moduleId: selectedModuleId !== "all" ? selectedModuleId : undefined,
        moduleName: selectedModule ? selectedModule.title : undefined,
        topicId: selectedTopicId !== "all" ? selectedTopicId : undefined,
        topicName: topicObj ? topicObj.title : undefined,
        resourceType: selectedType,
        customPrompt: customInstructions,
      });

      setCustomInstructions("");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Studio Header */}
      <div className="border-b border-border/60 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-primary">
            Curriculum Grounded Engine
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground mt-1">
            AI Studio
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Synthesize syllabus-aware notes, high-yield cheat sheets, and practice quizzes grounded exclusively in your uploaded slides, course textbooks, and verified module topics.
          </p>
        </div>

        <Badge variant="matcha" className="gap-1.5 self-start sm:self-auto">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Syllabus Verification Active</span>
        </Badge>
      </div>

      {/* Main Studio Grid: Generation Workbench + BYOK & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Generation Configuration Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resource Generation Workbench</CardTitle>
              <CardDescription>
                Select your academic scope. The engine constructs RAG context solely from corresponding syllabus units and documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-6">
                {/* 1. Target Course & Scope */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Target Course
                    </label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => {
                        setSelectedCourseId(e.target.value);
                        setSelectedModuleId("all");
                        setSelectedTopicId("all");
                      }}
                      className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} — {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Module Scope
                    </label>
                    <select
                      value={selectedModuleId}
                      onChange={(e) => {
                        setSelectedModuleId(e.target.value);
                        setSelectedTopicId("all");
                      }}
                      className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="all">Entire Course Syllabus</option>
                      {modules.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Topic Focus
                    </label>
                    <select
                      value={selectedTopicId}
                      onChange={(e) => setSelectedTopicId(e.target.value)}
                      disabled={selectedModuleId === "all"}
                      className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                    >
                      <option value="all">All Topics in Module</option>
                      {topics.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Resource Type Selection Cards */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">
                    Output Resource Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {RESOURCE_TYPES.map((item) => {
                      const Icon = item.icon;
                      const isSelected = selectedType === item.type;

                      return (
                        <div
                          key={item.type}
                          onClick={() => setSelectedType(item.type)}
                          className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 select-none ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-xs"
                              : "border-border bg-card hover:border-border/80"
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-foreground"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">
                              {item.title}
                            </span>
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Additional Instructions */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Custom Focus or Exam Directives (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Focus on proofs for recurrence relations, or include 5 tricky edge cases for exams..."
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Action button */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <span className="text-[11px] text-muted-foreground">
                    Grounded in {selectedCourse?.materials.length || 0} indexed course documents
                  </span>
                  <Button type="submit" size="default" disabled={isGenerating} className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>{isGenerating ? "Synthesizing with Citations..." : "Generate Resource"}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Generated Academic Resources Library */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                Generated Resources ({resources.length})
              </h3>
              <Link href="/resources" className="text-xs text-primary hover:underline">
                View Full Library
              </Link>
            </div>

            <div className="space-y-3">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="subtle" className="text-[10px] font-mono">
                          {res.courseCode}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {res.resourceType.replace("_", " ")}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {res.createdAt}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-foreground mt-1.5">
                        {res.title}
                      </h4>
                    </div>

                    <Link href={`/resources/${res.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <span>Open in BlockNote</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>

                  {/* Citations Preview */}
                  {res.citations && res.citations.length > 0 && (
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-background/50 p-2 rounded-lg border border-border/50">
                      <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">
                        Source Grounding: {res.citations[0].title}
                        {res.citations[0].page && ` (p. ${res.citations[0].page})`}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: BYOK Settings & Mindful Rules */}
        <div className="space-y-6">
          <BYOKSettingsCard />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Grounded RAG Principles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>
                  <strong className="text-foreground">Uploaded Material Priority:</strong> Primary explanations are directly extracted from your slides and textbook readings.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>
                  <strong className="text-foreground">Syllabus Scope Strictness:</strong> No out-of-syllabus topics are injected.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>
                  <strong className="text-foreground">No Fabricated Citations:</strong> If a fact is absent from uploaded documents, Miru marks it explicitly as general knowledge.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


"use client";

import * as React from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  RotateCcw,
  Plus,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Sparkles,
  FileText,
  UploadCloud,
} from "lucide-react";
import { Syllabus, SyllabusModule, SyllabusTopic } from "@/types/academic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAcademic } from "@/components/academic-provider";
import { SyllabusUploadModal } from "@/components/syllabus/syllabus-upload-modal";

interface SyllabusTreeProps {
  courseId: string;
  courseName: string;
  syllabus: Syllabus;
}

export function SyllabusTree({ courseId, courseName, syllabus }: SyllabusTreeProps) {
  const { updateTopicStatus, addSyllabusModule, addSyllabusTopic } = useAcademic();
  const [newModuleTitle, setNewModuleTitle] = React.useState("");
  const [activeModuleInput, setActiveModuleInput] = React.useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = React.useState("");
  const [expandedModules, setExpandedModules] = React.useState<Record<string, boolean>>(
    syllabus.modules.reduce((acc, m) => ({ ...acc, [m.id]: true }), {})
  );

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    addSyllabusModule(courseId, newModuleTitle.trim());
    setNewModuleTitle("");
  };

  const handleAddTopic = (e: React.FormEvent, modId: string) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    addSyllabusTopic(courseId, modId, newTopicTitle.trim());
    setNewTopicTitle("");
    setActiveModuleInput(null);
  };

  const getStatusIcon = (status: SyllabusTopic["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-primary" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "needs_revision":
        return <RotateCcw className="h-4 w-4 text-orange-400" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground/40" />;
    }
  };

  const cycleStatus = (
    currentStatus: SyllabusTopic["status"],
    modId: string,
    topId: string
  ) => {
    const sequence: SyllabusTopic["status"][] = [
      "not_started",
      "in_progress",
      "completed",
      "needs_revision",
    ];
    const nextIdx = (sequence.indexOf(currentStatus || "not_started") + 1) % sequence.length;
    updateTopicStatus(courseId, modId, topId, sequence[nextIdx]!);
  };

  return (
    <div className="space-y-6">
      {/* Syllabus Header Bar with Upload Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-card gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Curriculum & Syllabus Structure (v{syllabus.version})
            </h3>
            <p className="text-xs text-muted-foreground">
              {syllabus.modules.length} modules structured. Click status icons to toggle mastery.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SyllabusUploadModal courseId={courseId} courseName={courseName} />
        </div>
      </div>

      {/* Modules Tree */}
      {syllabus.modules.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-4">
          <UploadCloud className="h-10 w-10 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-foreground">No syllabus modules added yet</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Upload your syllabus PDF/DOCX to extract modules automatically, or add your first module manually below.
            </p>
          </div>
          <SyllabusUploadModal courseId={courseId} courseName={courseName} />
        </div>
      ) : (
        <div className="space-y-4">
          {syllabus.modules.map((module) => {
            const isExpanded = expandedModules[module.id] ?? true;
            const completedCount = module.topics.filter((t) => t.status === "completed").length;

            return (
              <div
                key={module.id}
                className="rounded-xl border border-border bg-card/60 overflow-hidden transition-all shadow-xs"
              >
                {/* Module Header Bar */}
                <div
                  onClick={() => toggleModule(module.id)}
                  className="flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/50 cursor-pointer border-b border-border/40 select-none"
                >
                  <div className="flex items-center gap-2.5">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-semibold text-sm text-foreground">
                      {module.title}
                    </span>
                    {module.hoursOrWeightage && (
                      <Badge variant="outline" className="text-[10px] py-0">
                        {module.hoursOrWeightage}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {completedCount} / {module.topics.length} topics
                    </span>
                  </div>
                </div>

                {/* Topics List */}
                {isExpanded && (
                  <div className="p-4 space-y-3">
                    {module.description && (
                      <p className="text-xs text-muted-foreground italic mb-2">
                        {module.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      {module.topics.map((topic) => (
                        <div
                          key={topic.id}
                          className="flex flex-col p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <button
                                onClick={() => cycleStatus(topic.status, module.id, topic.id)}
                                className="focus:outline-none cursor-pointer"
                                title={`Current: ${topic.status || "not_started"}. Click to change.`}
                              >
                                {getStatusIcon(topic.status)}
                              </button>
                              <span className="text-xs font-medium text-foreground">
                                {topic.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                                {topic.status?.replace("_", " ") || "not started"}
                              </span>
                            </div>
                          </div>

                          {topic.subtopics && topic.subtopics.length > 0 && (
                            <div className="ml-6 mt-2 space-y-1 border-l-2 border-border/60 pl-3">
                              {topic.subtopics.map((sub) => (
                                <div
                                  key={sub.id}
                                  className="text-[11px] text-muted-foreground flex items-center gap-1.5"
                                >
                                  <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                                  <span>{sub.title}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Topic In-place */}
                    {activeModuleInput === module.id ? (
                      <form
                        onSubmit={(e) => handleAddTopic(e, module.id)}
                        className="flex items-center gap-2 pt-2"
                      >
                        <input
                          type="text"
                          placeholder="New topic title..."
                          value={newTopicTitle}
                          onChange={(e) => setNewTopicTitle(e.target.value)}
                          autoFocus
                          className="h-8 flex-1 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                        <Button type="submit" size="sm" className="h-8 text-xs">
                          Add Topic
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => setActiveModuleInput(null)}
                        >
                          Cancel
                        </Button>
                      </form>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveModuleInput(module.id);
                          setNewTopicTitle("");
                        }}
                        className="text-xs text-primary hover:underline flex items-center gap-1 pt-2 font-medium cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Topic to this module
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Module Section */}
      <form
        onSubmit={handleAddModule}
        className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-border bg-card/30"
      >
        <input
          type="text"
          placeholder="New Module name (e.g. Module 5: Randomized Algorithms)..."
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
          className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
        />
        <Button type="submit" size="sm" className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" /> Add Module
        </Button>
      </form>
    </div>
  );
}

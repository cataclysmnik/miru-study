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
  Edit2,
  Trash2,
  Check,
  X,
  Eye,
  UploadCloud,
} from "lucide-react";
import { Syllabus, SyllabusModule, SyllabusTopic } from "@/types/academic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAcademic } from "@/components/academic-provider";
import { SyllabusUploadModal } from "@/components/syllabus/syllabus-upload-modal";
import { PDFViewerModal } from "@/components/viewer/pdf-viewer-modal";

interface SyllabusTreeProps {
  courseId: string;
  courseName: string;
  syllabus: Syllabus;
}

export function SyllabusTree({ courseId, courseName, syllabus }: SyllabusTreeProps) {
  const {
    updateTopicStatus,
    addSyllabusModule,
    editSyllabusModule,
    deleteSyllabusModule,
    addSyllabusTopic,
    editSyllabusTopic,
    deleteSyllabusTopic,
  } = useAcademic();

  const [newModuleTitle, setNewModuleTitle] = React.useState("");
  const [activeModuleInput, setActiveModuleInput] = React.useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = React.useState("");
  const [expandedModules, setExpandedModules] = React.useState<Record<string, boolean>>(
    syllabus.modules.reduce((acc, m) => ({ ...acc, [m.id]: true }), {})
  );

  // In-line editing states
  const [editingModuleId, setEditingModuleId] = React.useState<string | null>(null);
  const [editModuleTitle, setEditModuleTitle] = React.useState("");
  const [editModuleHours, setEditModuleHours] = React.useState("");

  const [editingTopicId, setEditingTopicId] = React.useState<string | null>(null);
  const [editTopicTitle, setEditTopicTitle] = React.useState("");

  // Syllabus PDF Viewer Modal State
  const [viewerOpen, setViewerOpen] = React.useState(false);

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    addSyllabusModule(courseId, newModuleTitle.trim());
    setNewModuleTitle("");
  };

  const handleSaveModuleEdit = async (modId: string) => {
    if (!editModuleTitle.trim()) return;
    await editSyllabusModule(courseId, modId, editModuleTitle.trim(), editModuleHours.trim());
    setEditingModuleId(null);
  };

  const handleAddTopic = (e: React.FormEvent, modId: string) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    addSyllabusTopic(courseId, modId, newTopicTitle.trim());
    setNewTopicTitle("");
    setActiveModuleInput(null);
  };

  const handleSaveTopicEdit = async (modId: string, topicId: string) => {
    if (!editTopicTitle.trim()) return;
    await editSyllabusTopic(courseId, modId, topicId, editTopicTitle.trim());
    setEditingTopicId(null);
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
      {/* Syllabus Viewer Modal */}
      <PDFViewerModal
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        title={`${courseName} — Syllabus Document`}
        storagePath={`syllabus/${courseId}/latest.pdf`}
      />

      {/* Syllabus Header Bar with Upload & View Button */}
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
              {syllabus.modules.length} modules configured. Click icons to toggle topic mastery or hover to edit/remove.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewerOpen(true)}
            className="h-8 gap-1.5 text-xs"
          >
            <Eye className="h-3.5 w-3.5 text-primary" />
            <span>View Syllabus File</span>
          </Button>

          <SyllabusUploadModal courseId={courseId} courseName={courseName} />
        </div>
      </div>

      {/* Modules Tree */}
      <div className="space-y-4">
        {syllabus.modules.map((module) => {
          const isExpanded = expandedModules[module.id] ?? true;
          const completedCount = module.topics.filter((t) => t.status === "completed").length;
          const isEditingThisModule = editingModuleId === module.id;

          return (
            <div
              key={module.id}
              className="rounded-xl border border-border bg-card/60 overflow-hidden transition-all shadow-xs group/mod"
            >
              {/* Module Header Bar */}
              <div className="flex items-center justify-between p-3.5 bg-secondary/30 border-b border-border/40 select-none">
                <div
                  className="flex items-center gap-2.5 flex-1 cursor-pointer"
                  onClick={() => !isEditingThisModule && toggleModule(module.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}

                  {isEditingThisModule ? (
                    <div className="flex items-center gap-2 flex-1 max-w-lg" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editModuleTitle}
                        onChange={(e) => setEditModuleTitle(e.target.value)}
                        className="h-8 flex-1 rounded-md border border-primary bg-background px-2.5 text-xs text-foreground focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Hours"
                        value={editModuleHours}
                        onChange={(e) => setEditModuleHours(e.target.value)}
                        className="h-8 w-24 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveModuleEdit(module.id)}
                        className="p-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingModuleId(null)}
                        className="p-1.5 rounded bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-semibold text-sm text-foreground">
                        {module.title}
                      </span>
                      {module.hoursOrWeightage && (
                        <Badge variant="outline" className="text-[10px] py-0">
                          {module.hoursOrWeightage}
                        </Badge>
                      )}
                    </>
                  )}
                </div>

                {/* Module Actions: Edit & Delete */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-[11px] mr-2">
                    {completedCount} / {module.topics.length} topics
                  </span>

                  {!isEditingThisModule && (
                    <div className="flex items-center gap-1 opacity-70 group-hover/mod:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingModuleId(module.id);
                          setEditModuleTitle(module.title);
                          setEditModuleHours(module.hoursOrWeightage || "");
                        }}
                        className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted"
                        title="Edit module name"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteSyllabusModule(courseId, module.id)}
                        className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Delete module"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
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
                    {module.topics.map((topic) => {
                      const isEditingThisTopic = editingTopicId === topic.id;

                      return (
                        <div
                          key={topic.id}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors group/top"
                        >
                          <div className="flex items-center gap-2.5 flex-1">
                            <button
                              onClick={() => cycleStatus(topic.status, module.id, topic.id)}
                              className="focus:outline-none cursor-pointer"
                              title={`Current: ${topic.status || "not_started"}. Click to cycle.`}
                            >
                              {getStatusIcon(topic.status)}
                            </button>

                            {isEditingThisTopic ? (
                              <div className="flex items-center gap-2 flex-1 max-w-md">
                                <input
                                  type="text"
                                  value={editTopicTitle}
                                  onChange={(e) => setEditTopicTitle(e.target.value)}
                                  className="h-7 flex-1 rounded border border-primary bg-background px-2 text-xs text-foreground focus:outline-none"
                                />
                                <button
                                  onClick={() => handleSaveTopicEdit(module.id, topic.id)}
                                  className="p-1 rounded bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => setEditingTopicId(null)}
                                  className="p-1 rounded bg-muted text-muted-foreground hover:text-foreground"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs font-medium text-foreground">
                                {topic.title}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                              {topic.status?.replace("_", " ") || "not started"}
                            </span>

                            {!isEditingThisTopic && (
                              <div className="flex items-center gap-1 opacity-0 group-hover/top:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setEditingTopicId(topic.id);
                                    setEditTopicTitle(topic.title);
                                  }}
                                  className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted"
                                  title="Edit topic title"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => deleteSyllabusTopic(courseId, module.id, topic.id)}
                                  className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  title="Delete topic"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
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

      {/* Add New Module Section */}
      <form
        onSubmit={handleAddModule}
        className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-border bg-card/30"
      >
        <input
          type="text"
          placeholder="New Module name (e.g. Module 9: Flight Regulations & Safety)..."
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

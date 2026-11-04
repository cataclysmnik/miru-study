"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  FileText,
  FileCheck2,
  Sparkles,
  Layers,
  ArrowRight,
  X,
  GraduationCap,
} from "lucide-react";
import { useAcademic } from "@/components/academic-provider";
import { useAI } from "@/components/ai-provider";
import { PDFViewerModal } from "@/components/viewer/pdf-viewer-modal";

interface SearchResultItem {
  id: string;
  category: "course" | "module" | "topic" | "material" | "resource";
  title: string;
  subtitle: string;
  url?: string;
  onClick?: () => void;
  badge?: string;
  storagePath?: string;
}

export function GlobalSearch() {
  const router = useRouter();
  const { courses } = useAcademic();
  const { resources } = useAI();

  const [isOpen, setIsOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [mounted, setMounted] = React.useState(false);

  // PDF Viewer for directly opening PDF search results
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [viewerTitle, setViewerTitle] = React.useState("");
  const [viewerStoragePath, setViewerStoragePath] = React.useState<string | undefined>(undefined);

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Graceful close trigger with animation
  const handleClose = React.useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setQuery("");
      setSelectedIndex(0);
    }, 180); // matches transition duration
  }, []);

  const handleOpen = React.useCallback(() => {
    setIsClosing(false);
    setIsOpen(true);
  }, []);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          handleClose();
        } else {
          handleOpen();
        }
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose, handleOpen]);

  // Focus input when dialog opens
  React.useEffect(() => {
    if (isOpen && !isClosing) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen, isClosing]);

  // Close when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    if (isOpen && !isClosing) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isClosing, handleClose]);

  // Aggregate and search across all academic entities
  const results = React.useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      // Default suggested items (recent courses and quick navigation)
      const suggestions: SearchResultItem[] = courses.slice(0, 4).map((c) => ({
        id: `course-${c.id}`,
        category: "course",
        title: `${c.code ? `${c.code}: ` : ""}${c.name}`,
        subtitle: `Course Workspace • ${c.semesterName || "Current Semester"}`,
        url: `/courses/${c.id}`,
        badge: "Course",
      }));

      suggestions.push({
        id: "nav-ai-studio",
        category: "resource",
        title: "AI Studio",
        subtitle: "Generate revision notes, MCQ question banks & cheat sheets",
        url: "/ai-studio",
        badge: "AI Studio",
      });

      suggestions.push({
        id: "nav-planner",
        category: "resource",
        title: "Study Planner & Deadlines",
        subtitle: "Manage academic milestones, exam countdowns & weekly focus",
        url: "/planner",
        badge: "Planner",
      });

      return suggestions;
    }

    const matched: SearchResultItem[] = [];

    // 1. Search Courses
    courses.forEach((c) => {
      if (
        c.name.toLowerCase().includes(trimmed) ||
        (c.code && c.code.toLowerCase().includes(trimmed)) ||
        (c.description && c.description.toLowerCase().includes(trimmed))
      ) {
        matched.push({
          id: `course-${c.id}`,
          category: "course",
          title: `${c.code ? `${c.code}: ` : ""}${c.name}`,
          subtitle: `Course Workspace • ${c.semesterName || "Academic Semester"}`,
          url: `/courses/${c.id}`,
          badge: "Course",
        });
      }

      // 2. Search Syllabus Modules & Topics
      if (c.syllabus?.modules) {
        c.syllabus.modules.forEach((mod) => {
          if (mod.title.toLowerCase().includes(trimmed)) {
            matched.push({
              id: `module-${mod.id}`,
              category: "module",
              title: mod.title,
              subtitle: `Module in ${c.code || c.name} • ${mod.topics?.length || 0} topics`,
              url: `/courses/${c.id}?tab=syllabus`,
              badge: "Module",
            });
          }

          if (mod.topics) {
            mod.topics.forEach((t) => {
              if (t.title.toLowerCase().includes(trimmed)) {
                matched.push({
                  id: `topic-${t.id}`,
                  category: "topic",
                  title: t.title,
                  subtitle: `Topic in ${mod.title} (${c.code || c.name})`,
                  url: `/courses/${c.id}?tab=syllabus`,
                  badge: "Topic",
                });
              }
            });
          }
        });
      }

      // 3. Search Study Materials (Files / PDFs)
      if (c.materials) {
        c.materials.forEach((mat) => {
          if (
            mat.title.toLowerCase().includes(trimmed) ||
            mat.fileName.toLowerCase().includes(trimmed)
          ) {
            matched.push({
              id: `mat-${mat.id}`,
              category: "material",
              title: mat.title || mat.fileName,
              subtitle: `Material in ${c.code || c.name} • ${mat.fileType.toUpperCase()}`,
              badge: mat.fileType.toUpperCase(),
              storagePath: (mat as any).storagePath,
              onClick: () => {
                const storagePath = (mat as any).storagePath;
                if (storagePath) {
                  setViewerTitle(mat.title || mat.fileName);
                  setViewerStoragePath(storagePath);
                  setViewerOpen(true);
                  handleClose();
                } else {
                  router.push(`/courses/${c.id}?tab=materials`);
                  handleClose();
                }
              },
            });
          }
        });
      }
    });

    // 4. Search Generated Resources (Notes, Cheat Sheets, MCQs)
    resources.forEach((r) => {
      if (
        r.title.toLowerCase().includes(trimmed) ||
        r.courseCode.toLowerCase().includes(trimmed)
      ) {
        matched.push({
          id: `res-${r.id}`,
          category: "resource",
          title: r.title,
          subtitle: `${r.courseCode} • ${r.resourceType.replace(/_/g, " ")}`,
          url: `/resources/${r.id}`,
          badge: r.resourceType.toUpperCase(),
        });
      }
    });

    return matched.slice(0, 10);
  }, [query, courses, resources, router, handleClose]);

  // Handle Enter key and arrow navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  const handleSelect = (item: SearchResultItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.url) {
      router.push(item.url);
      handleClose();
    }
  };

  const getCategoryIcon = (category: SearchResultItem["category"]) => {
    switch (category) {
      case "course":
        return <GraduationCap className="h-4 w-4 text-primary" />;
      case "module":
        return <Layers className="h-4 w-4 text-amber-500" />;
      case "topic":
        return <FileCheck2 className="h-4 w-4 text-emerald-500" />;
      case "material":
        return <FileText className="h-4 w-4 text-blue-400" />;
      case "resource":
        return <Sparkles className="h-4 w-4 text-purple-400" />;
      default:
        return <BookOpen className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <>
      {/* Trigger Input in Header */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          readOnly
          onClick={handleOpen}
          placeholder="Search courses, syllabi, notes, formula sheets..."
          className="h-10 w-full rounded-xl border border-border bg-background/50 pl-10 pr-12 text-xs font-normal text-foreground placeholder:text-muted-foreground/70 hover:border-primary/50 focus:outline-none transition-all cursor-pointer"
        />
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Global Command Palette Portal attached directly to document.body */}
      {mounted &&
        isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 pointer-events-auto">
            {/* Backdrop with Frosted Blur with Smooth Fade In/Out */}
            <div
              className={`fixed inset-0 bg-stone-900/60 dark:bg-black/75 backdrop-blur-md transition-opacity duration-200 ease-out ${
                isClosing ? "opacity-0" : "opacity-100"
              }`}
              onClick={handleClose}
            />

            {/* Search Palette Container with Springy Scale & Fade Animation */}
            <div
              ref={containerRef}
              className={`relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ease-out ${
                isClosing
                  ? "opacity-0 scale-95 -translate-y-2"
                  : "opacity-100 scale-100 translate-y-0"
              }`}
              style={{
                animation: !isClosing ? "paletteEnter 200ms cubic-bezier(0.16, 1, 0.3, 1)" : undefined,
              }}
            >
              {/* Input Header */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-card">
                <Search className="h-4 w-4 text-primary shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search courses, modules, topics, PDFs, or AI notes..."
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="text-muted-foreground hover:text-foreground text-xs p-1 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Results Stream */}
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {results.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground space-y-1">
                    <p>No results found for &ldquo;{query}&rdquo;</p>
                    <p className="text-[11px] opacity-70">
                      Try searching for course codes, topic names, or material titles.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {query.trim() ? "Search Results" : "Quick Suggestions"}
                    </div>
                    {results.map((item, index) => {
                      const isSelected = index === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary/10 text-foreground"
                              : "hover:bg-muted/60 text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                              {getCategoryIcon(item.category)}
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-medium text-foreground truncate">
                                {item.title}
                              </div>
                              <div className="text-[11px] text-muted-foreground truncate">
                                {item.subtitle}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-4">
                            {item.badge && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-border bg-muted text-muted-foreground">
                                {item.badge}
                              </span>
                            )}
                            <ArrowRight
                              className={`h-3.5 w-3.5 transition-transform ${
                                isSelected
                                  ? "text-primary translate-x-0.5"
                                  : "text-muted-foreground/40"
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Palette Footer Help */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/40 text-[11px] text-muted-foreground select-none">
                <div className="flex items-center gap-3">
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded border border-border bg-card font-mono text-[10px]">
                      ↑↓
                    </kbd>{" "}
                    Navigate
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded border border-border bg-card font-mono text-[10px]">
                      ↵
                    </kbd>{" "}
                    Select
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded border border-border bg-card font-mono text-[10px]">
                      esc
                    </kbd>{" "}
                    Close
                  </span>
                </div>
                <span className="font-mono text-[10px] text-primary">Miru Academic Search</span>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Direct PDF Viewer Modal when opening PDFs from Search */}
      {viewerOpen && (
        <PDFViewerModal
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          title={viewerTitle}
          storagePath={viewerStoragePath}
        />
      )}
    </>
  );
}

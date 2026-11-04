"use client";

import * as React from "react";
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  CalendarCheck2,
  Trash2,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAcademic } from "@/components/academic-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TaskItem {
  id: string;
  courseCode: string;
  topicTitle?: string;
  title: string;
  dueDate: string;
  dateKey: string; // YYYY-MM-DD
  isExam: boolean;
  isCompleted: boolean;
}

const INITIAL_PLANNER_TASKS: TaskItem[] = [
  {
    id: "task-1",
    courseCode: "CS 301",
    topicTitle: "0/1 Knapsack & Fractional Variants",
    title: "Dynamic Programming: Knapsack & Longest Common Subsequence",
    dueDate: "Today, 18:00",
    dateKey: "2026-11-04",
    isExam: false,
    isCompleted: false,
  },
  {
    id: "task-2",
    courseCode: "CS 340",
    topicTitle: "Raft Leader Election & Term Transitions",
    title: "Mid-Term Examination: Raft Consensus Protocols",
    dueDate: "Nov 12, 10:00 AM",
    dateKey: "2026-11-12",
    isExam: true,
    isCompleted: false,
  },
  {
    id: "task-3",
    courseCode: "MATH 210",
    topicTitle: "Singular Value Decomposition (SVD)",
    title: "Review SVD Decomposition Notes & Practice Flashcards",
    dueDate: "Nov 15, 23:59",
    dateKey: "2026-11-15",
    isExam: false,
    isCompleted: true,
  },
  {
    id: "task-4",
    courseCode: "CS 301",
    topicTitle: "Minimum Spanning Trees: Kruskal & Prim",
    title: "Solve Prim's Algorithm and Disjoint Set Exercises",
    dueDate: "Nov 18, 14:00",
    dateKey: "2026-11-18",
    isExam: false,
    isCompleted: false,
  },
];

export default function PlannerPage() {
  const { courses } = useAcademic();
  const [tasks, setTasks] = React.useState<TaskItem[]>(INITIAL_PLANNER_TASKS);
  const [selectedFilter, setSelectedFilter] = React.useState<string>("all");
  const [modalOpen, setModalOpen] = React.useState(false);

  // New task form state
  const [newTitle, setNewTitle] = React.useState("");
  const [newCourseCode, setNewCourseCode] = React.useState(courses[0]?.code || "CS 301");
  const [newDueDate, setNewDueDate] = React.useState("");
  const [newIsExam, setNewIsExam] = React.useState(false);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      courseCode: newCourseCode,
      title: newTitle.trim(),
      dueDate: newDueDate || "Upcoming",
      dateKey: "2026-11-20",
      isExam: newIsExam,
      isCompleted: false,
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTitle("");
    setNewDueDate("");
    setNewIsExam(false);
    setModalOpen(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedFilter === "exams") return t.isExam;
    if (selectedFilter === "completed") return t.isCompleted;
    if (selectedFilter === "pending") return !t.isCompleted;
    if (selectedFilter !== "all") return t.courseCode === selectedFilter;
    return true;
  });

  const completedCount = tasks.filter((t) => t.isCompleted).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Planner Header */}
      <div className="border-b border-border/60 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-primary">
            Academic Schedule & Syllabus Milestones
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground mt-1">
            Study Planner
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track exam dates, topic review schedules, and deliberate study sessions directly linked to course curricula.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                <span>Add Study Task</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[460px]">
              <form onSubmit={handleCreateTask} className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CalendarCheck2 className="h-5 w-5 text-primary" />
                    <span>Create Study Task</span>
                  </DialogTitle>
                  <DialogDescription>
                    Add a targeted study session, problem set, or exam milestone.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Task / Milestone Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master DP Tabulation & Knapsack Proofs"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Course
                    </label>
                    <select
                      value={newCourseCode}
                      onChange={(e) => setNewCourseCode(e.target.value)}
                      className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.code}>
                          {c.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Target Due Date
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tomorrow, 18:00 or Nov 20"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isExamCheck"
                    checked={newIsExam}
                    onChange={(e) => setNewIsExam(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <label
                    htmlFor="isExamCheck"
                    className="text-xs text-foreground font-medium cursor-pointer"
                  >
                    Mark as Official Exam / Test Milestone
                  </label>
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Save Task
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter Ribbon & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Tasks" },
            { id: "pending", label: "Incomplete" },
            { id: "exams", label: "Exams Only" },
            { id: "completed", label: "Completed" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedFilter === f.id
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{completedCount}</span> of{" "}
          <span className="font-semibold text-foreground">{tasks.length}</span> tasks finished
        </div>
      </div>

      {/* Main Grid: Task Checklist & Month Schedule View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Interactive Task List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-2">
              <CalendarCheck2 className="h-8 w-8 text-muted-foreground mx-auto" />
              <h4 className="text-sm font-semibold text-foreground">No tasks in this view</h4>
              <p className="text-xs text-muted-foreground">
                All planned academic items are completed or filtered out.
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all text-xs shadow-xs"
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="pt-0.5 focus:outline-none cursor-pointer"
                    title={task.isCompleted ? "Mark incomplete" : "Mark completed"}
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/50 hover:text-primary transition-colors" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={task.isExam ? "destructive" : "subtle"}
                        className="text-[10px] font-mono py-0 px-1.5"
                      >
                        {task.courseCode}
                      </Badge>
                      {task.isExam && (
                        <Badge variant="outline" className="text-[9px] py-0 border-destructive/40 text-destructive">
                          Official Exam
                        </Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {task.dueDate}
                      </span>
                    </div>

                    <p
                      className={`text-sm font-medium ${
                        task.isCompleted
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </p>

                    {task.topicTitle && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>Syllabus Target: {task.topicTitle}</span>
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  title="Remove task"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Right 1 Col: Calendar Snapshot & Deliberate Study Rules */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span>November 2026</span>
              </CardTitle>
              <CardDescription>Academic Term Milestones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground pb-1">
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
                <span>S</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: 30 }).map((_, i) => {
                  const day = i + 1;
                  const isToday = day === 4;
                  const hasExam = day === 12;
                  const hasTask = day === 15 || day === 18;

                  return (
                    <div
                      key={day}
                      className={`h-8 flex flex-col items-center justify-center rounded-lg text-[11px] transition-colors ${
                        isToday
                          ? "bg-primary text-primary-foreground font-bold shadow-xs"
                          : hasExam
                          ? "bg-destructive/15 text-destructive font-semibold border border-destructive/30"
                          : hasTask
                          ? "bg-secondary text-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span>{day}</span>
                      {hasExam && <div className="h-1 w-1 rounded-full bg-destructive mt-0.5" />}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground space-y-2">
            <span className="font-semibold text-primary">Mindful Pacing Principle</span>
            <p className="leading-relaxed">
              Limit each study session to one focused syllabus module. Break down multi-hour revision blocks into bite-sized topic checkpoints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


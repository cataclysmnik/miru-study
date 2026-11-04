"use client";

import * as React from "react";
import { Plus, BookOpen, Layers } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAcademic } from "@/components/academic-provider";

const COLOR_PRESETS = [
  { name: "Matcha", hex: "#6b8048" },
  { name: "Earth Clay", hex: "#b08968" },
  { name: "Slate River", hex: "#607274" },
  { name: "Deep Indigo", hex: "#435585" },
  { name: "Ochre Cedar", hex: "#c38154" },
];

export function CreateCourseModal() {
  const [open, setOpen] = React.useState(false);
  const { years, addCourse } = useAcademic();

  const currentYear = years.find((y) => y.isCurrent) || years[0];
  const allSemesters = currentYear ? currentYear.semesters : [];

  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [credits, setCredits] = React.useState("4.0");
  const [instructor, setInstructor] = React.useState("");
  const [selectedSemesterId, setSelectedSemesterId] = React.useState(
    allSemesters[0]?.id || ""
  );
  const [color, setColor] = React.useState(COLOR_PRESETS[0].hex);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const semester = allSemesters.find((s) => s.id === selectedSemesterId);

    addCourse({
      name: name.trim(),
      code: code.trim(),
      description: description.trim(),
      credits: parseFloat(credits) || 3.0,
      instructorName: instructor.trim() || undefined,
      semesterId: selectedSemesterId,
      semesterName: semester?.name || "Current Semester",
      color,
    });

    // Reset and close
    setName("");
    setCode("");
    setDescription("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          <span>New Course</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Create Academic Course</span>
            </DialogTitle>
            <DialogDescription>
              Add a new course to your current semester workspace. Syllabi and materials can be linked immediately after.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Course Code
              </label>
              <input
                type="text"
                placeholder="e.g. CS 301"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Course Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Design & Analysis of Algorithms"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Semester / Term
              </label>
              <select
                value={selectedSemesterId}
                onChange={(e) => setSelectedSemesterId(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                {allSemesters.map((sem) => (
                  <option key={sem.id} value={sem.id}>
                    {sem.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Credits
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="4.0"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Instructor / Professor
            </label>
            <input
              type="text"
              placeholder="e.g. Prof. Hiroshi Tanaka"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Course Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief course objectives, scope, or focus areas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.hex}
                  onClick={() => setColor(preset.hex)}
                  className={`h-7 w-7 rounded-full border transition-all ${
                    color === preset.hex
                      ? "ring-2 ring-primary ring-offset-2 scale-110"
                      : "opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: preset.hex }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Create Course
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


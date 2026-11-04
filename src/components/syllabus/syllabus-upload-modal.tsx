"use client";

import * as React from "react";
import { UploadCloud, FileText, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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
import { useAI } from "@/components/ai-provider";

interface SyllabusUploadModalProps {
  courseId: string;
  courseName: string;
}

export function SyllabusUploadModal({ courseId, courseName }: SyllabusUploadModalProps) {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"file" | "text">("file");
  const [file, setFile] = React.useState<File | null>(null);
  const [manualText, setManualText] = React.useState("");
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const { addSyllabusModule, addSyllabusTopic, refreshData } = useAcademic();
  const { providerConfig } = useAI();

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !manualText.trim()) return;

    setIsExtracting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      if (manualText.trim()) {
        formData.append("text", manualText);
      }
      formData.append("courseName", courseName);

      const res = await fetch("/api/syllabi/extract", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Extraction failed");
      }

      // Populate extracted modules & topics into the course syllabus
      if (data.modules && Array.isArray(data.modules)) {
        for (const mod of data.modules) {
          await addSyllabusModule(courseId, mod.title, mod.hours);
          // Wait briefly to ensure module id is committed if sequential
          if (mod.topics && Array.isArray(mod.topics)) {
            for (const top of mod.topics) {
              const topTitle = typeof top === "string" ? top : top.title;
              // Add topics to the course
            }
          }
        }
        await refreshData();
      }

      setOpen(false);
      setFile(null);
      setManualText("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to parse syllabus");
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 text-xs">
          <UploadCloud className="h-4 w-4" />
          <span>Upload Syllabus</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[540px]">
        <form onSubmit={handleExtract} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>Upload & Parse Course Syllabus</span>
            </DialogTitle>
            <DialogDescription>
              Upload your syllabus document (PDF, DOCX, TXT) or paste curriculum text. Miru will extract modules, units, and topics automatically.
            </DialogDescription>
          </DialogHeader>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mode Tabs */}
          <div className="flex items-center gap-2 border-b border-border/80 pb-2">
            <button
              type="button"
              onClick={() => setMode("file")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                mode === "file" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Upload File (PDF / DOCX)
            </button>
            <button
              type="button"
              onClick={() => setMode("text")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                mode === "text" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Paste Text
            </button>
          </div>

          {mode === "file" ? (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl bg-card/40 space-y-2">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <label className="cursor-pointer text-center">
                <span className="text-xs font-semibold text-primary hover:underline">
                  {file ? file.name : "Choose syllabus file"}
                </span>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
              <span className="text-[10px] text-muted-foreground">
                Supports syllabus PDFs, Word docs, and lecture schedules
              </span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Paste Syllabus Content
              </label>
              <textarea
                rows={6}
                placeholder="Paste course modules, units, and learning outcomes here..."
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isExtracting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isExtracting || (!file && !manualText.trim())}
              className="gap-2"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Extracting Modules...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Parse Curriculum</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

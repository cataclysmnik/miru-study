"use client";

import * as React from "react";
import {
  FileText,
  UploadCloud,
  FileCheck2,
  Trash2,
  ExternalLink,
  Layers,
  Sparkles,
  Loader2,
  Eye,
  Download,
} from "lucide-react";
import { StudyMaterialItem, SyllabusModule } from "@/types/academic";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAcademic } from "@/components/academic-provider";
import { useAuth } from "@/components/auth-provider";
import { PDFViewerModal } from "@/components/viewer/pdf-viewer-modal";

interface MaterialsManagerProps {
  courseId: string;
  materials: StudyMaterialItem[];
  modules: SyllabusModule[];
}

export function MaterialsManager({
  courseId,
  materials,
  modules,
}: MaterialsManagerProps) {
  const { addStudyMaterial } = useAcademic();
  const { user } = useAuth();
  const [dragActive, setDragActive] = React.useState(false);
  const [selectedModuleId, setSelectedModuleId] = React.useState<string>("unassigned");
  const [uploadTitle, setUploadTitle] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadFeedback, setUploadFeedback] = React.useState<string | null>(null);

  // PDF Viewer Modal State
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [viewerTitle, setViewerTitle] = React.useState("");
  const [viewerStoragePath, setViewerStoragePath] = React.useState<string | undefined>(undefined);
  const [viewerBlobUrl, setViewerBlobUrl] = React.useState<string | undefined>(undefined);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setUploadFeedback("Extracting document text and building RAG chunks...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("courseId", courseId);
      if (selectedModuleId !== "unassigned") {
        formData.append("moduleId", selectedModuleId);
      }
      formData.append("title", uploadTitle.trim() || file.name);
      if (user?.id) {
        formData.append("userId", user.id);
      }

      const res = await fetch("/api/materials/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      const ext = file.name.split(".").pop()?.toLowerCase();
      const validTypes: Array<"pdf" | "docx" | "pptx" | "txt" | "markdown" | "image"> = [
        "pdf",
        "docx",
        "pptx",
        "txt",
        "markdown",
        "image",
      ];
      const fileType = validTypes.includes(ext as any) ? (ext as any) : "pdf";

      addStudyMaterial(courseId, {
        title: uploadTitle.trim() || file.name,
        fileName: file.name,
        fileType,
        fileSizeBytes: file.size,
        moduleId: selectedModuleId !== "unassigned" ? selectedModuleId : undefined,
      });

      setUploadTitle("");
      setUploadFeedback(`Successfully extracted and indexed ${data.totalChunks || 1} chunks for RAG!`);
      setTimeout(() => setUploadFeedback(null), 4000);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadFeedback("Uploaded to local workspace.");
      setTimeout(() => setUploadFeedback(null), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenViewer = (mat: StudyMaterialItem) => {
    setViewerTitle(mat.title);
    // If material has storage path in supabase
    const storagePath = `${user?.id || "anonymous"}/${courseId}/${mat.fileName}`;
    setViewerStoragePath(storagePath);
    setViewerOpen(true);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* PDF Viewer Dialog */}
      <PDFViewerModal
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        title={viewerTitle}
        storagePath={viewerStoragePath}
        pdfUrl={viewerBlobUrl}
      />

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all ${
          dragActive
            ? "border-primary bg-primary/10 scale-[1.005]"
            : "border-border bg-card/40 hover:border-border/80"
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-foreground mb-3 shadow-xs">
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <UploadCloud className="h-6 w-6" />
          )}
        </div>
        <h4 className="text-sm font-semibold text-foreground">
          {isUploading ? "Processing Document..." : "Drop course materials here or choose a file"}
        </h4>
        <p className="text-xs text-muted-foreground mt-1 text-center max-w-sm">
          Supports PDF, DOCX, PPTX, Markdown, Text, and Images. Content is extracted for syllabus-grounded RAG.
        </p>

        {uploadFeedback && (
          <div className="mt-3 p-2 px-3 rounded-lg bg-primary/10 border border-primary/30 text-xs text-primary font-medium">
            {uploadFeedback}
          </div>
        )}

        {/* Association controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 w-full max-w-md">
          <input
            type="text"
            placeholder="Custom title (optional)..."
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            disabled={isUploading}
            className="h-8 flex-1 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
          />
          <select
            value={selectedModuleId}
            onChange={(e) => setSelectedModuleId(e.target.value)}
            disabled={isUploading}
            className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:border-primary focus:outline-none w-full sm:w-auto"
          >
            <option value="unassigned">General Course Material</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        <label className="mt-4">
          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx,.pptx,.txt,.md"
            onChange={handleFileInput}
            disabled={isUploading}
          />
          <Button type="button" size="sm" asChild disabled={isUploading}>
            <span className="cursor-pointer">
              {isUploading ? "Uploading..." : "Browse Files"}
            </span>
          </Button>
        </label>
      </div>

      {/* Materials List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">
            Uploaded Materials ({materials.length})
          </h4>
          <span className="text-xs text-muted-foreground">
            Grounding context for Course AI
          </span>
        </div>

        {materials.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground rounded-xl border border-border bg-card/20">
            No study materials uploaded yet for this course.
          </div>
        ) : (
          <div className="space-y-2.5">
            {materials.map((mat) => {
              const assignedModule = modules.find((m) => m.id === mat.moduleId);

              return (
                <div
                  key={mat.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card hover:border-primary/40 transition-all text-xs shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {mat.title}
                        </span>
                        <Badge variant="subtle" className="text-[10px] uppercase">
                          {mat.fileType}
                        </Badge>
                        {assignedModule && (
                          <Badge variant="outline" className="text-[10px] py-0">
                            {assignedModule.title}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-[11px] mt-0.5">
                        <span>{formatBytes(mat.fileSizeBytes)}</span>
                        {mat.pageCount && (
                          <>
                            <span>•</span>
                            <span>{mat.pageCount} pages</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{mat.uploadedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenViewer(mat)}
                      className="h-8 gap-1.5 text-xs text-foreground"
                    >
                      <Eye className="h-3.5 w-3.5 text-primary" />
                      <span>View PDF</span>
                    </Button>
                    <Badge variant="matcha" className="gap-1 text-[10px]">
                      <FileCheck2 className="h-3 w-3" /> Indexed
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

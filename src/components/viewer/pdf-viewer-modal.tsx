"use client";

import * as React from "react";
import {
  X,
  Download,
  ExternalLink,
  FileText,
  Maximize2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PDFViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  pdfUrl?: string; // direct url or blob url
  storagePath?: string; // Supabase storage path to generate signed URL
}

export function PDFViewerModal({
  open,
  onOpenChange,
  title,
  pdfUrl,
  storagePath,
}: PDFViewerModalProps) {
  const [activeUrl, setActiveUrl] = React.useState<string | null>(pdfUrl || null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function resolveUrl() {
      if (!open) return;

      if (pdfUrl) {
        setActiveUrl(pdfUrl);
        return;
      }

      if (storagePath) {
        setIsLoading(true);
        setErrorMsg(null);
        try {
          const res = await fetch(`/api/materials/view?path=${encodeURIComponent(storagePath)}`);
          const data = await res.json();
          if (data.signedUrl) {
            setActiveUrl(data.signedUrl);
          } else {
            setErrorMsg(data.error || "Unable to retrieve document preview");
          }
        } catch (err: any) {
          setErrorMsg(err.message || "Failed to load document");
        } finally {
          setIsLoading(false);
        }
      }
    }

    resolveUrl();
  }, [open, pdfUrl, storagePath]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border-border bg-card shadow-2xl">
        {/* Viewer Header Toolbar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card/90 select-none">
          <div className="flex items-center gap-2.5 truncate pr-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div className="truncate">
              <DialogTitle className="text-sm font-semibold truncate leading-tight">
                {title}
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground">
                Document Viewer • Supabase Academic Storage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeUrl && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 gap-1.5 text-xs"
                >
                  <a href={activeUrl} download={title} target="_blank" rel="noopener noreferrer">
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 gap-1.5 text-xs"
                >
                  <a href={activeUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">New Tab</span>
                  </a>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Viewer Main Body */}
        <div className="flex-1 w-full h-full bg-muted/40 relative flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 text-xs text-muted-foreground animate-pulse">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span>Generating secure preview stream...</span>
            </div>
          ) : errorMsg ? (
            <div className="p-8 text-center space-y-2">
              <FileText className="h-8 w-8 text-destructive mx-auto" />
              <p className="text-xs font-semibold text-foreground">{errorMsg}</p>
            </div>
          ) : activeUrl ? (
            <iframe
              src={`${activeUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              title={title}
              className="w-full h-full border-none rounded-b-2xl bg-white"
            />
          ) : (
            <div className="text-xs text-muted-foreground">No preview available</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

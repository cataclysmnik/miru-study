"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NativePDFCanvas = dynamic(
  () =>
    import("@/components/viewer/native-pdf-canvas").then(
      (m) => m.NativePDFCanvas
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-card text-muted-foreground text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span>Loading document engine...</span>
      </div>
    ),
  }
);

interface PDFViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  pdfUrl?: string;
  storagePath?: string;
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
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);

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

  // Reset fullscreen when closed
  React.useEffect(() => {
    if (!open) {
      setIsFullscreen(false);
    }
  }, [open]);

  // Handle ESC key to exit fullscreen first or close modal
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          e.stopPropagation();
          setIsFullscreen(false);
        } else {
          onOpenChange(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isFullscreen, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
      {/* Dynamic Theme Opaque Scrim Backdrop with aesthetic backdrop blur:
          Light Mode: Warm Sand/Stone dimming
          Dark Mode: Rich Wabi-Sabi Dark Slate/Earth dimming */}
      <div
        className="fixed inset-0 bg-stone-900/60 dark:bg-black/75 backdrop-blur-md transition-opacity duration-200"
        onClick={() => onOpenChange(false)}
      />

      {/* Reader Container - Centered Modal scaling smoothly from center with wabi-sabi card tokens */}
      <div
        className={`relative z-10 flex flex-col overflow-hidden border border-border bg-card shadow-2xl transition-all duration-300 ease-in-out ${
          isFullscreen
            ? "w-screen h-screen rounded-none"
            : "w-[94vw] max-w-[1300px] h-[92vh] rounded-2xl"
        }`}
      >
        {/* Miru Native Header Toolbar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-card select-none shrink-0 z-20">
          <div className="flex items-center gap-3 truncate pr-4 sm:pr-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div className="truncate">
              <h2 className="text-sm font-semibold truncate leading-tight text-foreground">
                {title}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Miru Native Reader • Continuous Canvas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Fullscreen Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="h-8 gap-1.5 text-xs border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline">Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </>
              )}
            </Button>

            {activeUrl && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 gap-1.5 text-xs border-border text-foreground hover:bg-muted"
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
                  className="h-8 gap-1.5 text-xs border-border text-foreground hover:bg-muted"
                >
                  <a href={activeUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">New Tab</span>
                  </a>
                </Button>
              </>
            )}

            {/* Explicit Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted ml-1"
              title="Close reader"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        {/* Native PDF Canvas Continuous Reader Area */}
        <div className="flex-1 w-full h-full relative overflow-hidden bg-card">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-xs text-muted-foreground animate-pulse">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span>Streaming secure preview from Supabase...</span>
            </div>
          ) : errorMsg ? (
            <div className="p-8 text-center space-y-2">
              <FileText className="h-8 w-8 text-destructive mx-auto" />
              <p className="text-xs text-foreground">{errorMsg}</p>
            </div>
          ) : activeUrl ? (
            <NativePDFCanvas url={activeUrl} />
          ) : (
            <div className="text-xs text-muted-foreground p-8 text-center">
              No preview available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

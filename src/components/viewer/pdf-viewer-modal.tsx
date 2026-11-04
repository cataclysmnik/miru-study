"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  X,
  Download,
  ExternalLink,
  FileText,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Dynamically import Native PDF canvas to guarantee no SSR mismatch
const NativePDFCanvas = dynamic(
  () =>
    import("@/components/viewer/native-pdf-canvas").then(
      (m) => m.NativePDFCanvas
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#181916] text-[#b5b3a8] text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-[#6b8048] mr-2" />
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
      <DialogContent className="!w-[94vw] !max-w-[1300px] !h-[92vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border border-[#2e302b] bg-[#181916] shadow-2xl">
        {/* Miru Native Header Toolbar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#2e302b] bg-[#1d1f1b] select-none shrink-0">
          <div className="flex items-center gap-3 truncate pr-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6b8048]/20 text-[#6b8048] shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div className="truncate">
              <DialogTitle className="text-sm font-semibold truncate leading-tight text-[#e7e6df]">
                {title}
              </DialogTitle>
              <p className="text-[11px] text-[#b5b3a8]">
                Miru Native Reader • Wabi-Sabi Study Canvas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 mr-8">
            {activeUrl && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 gap-1.5 text-xs border-[#2e302b] text-[#e7e6df] hover:bg-[#2e302b]"
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
                  className="h-8 gap-1.5 text-xs border-[#2e302b] text-[#e7e6df] hover:bg-[#2e302b]"
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

        {/* Native PDF Canvas Component */}
        <div className="flex-1 w-full h-[calc(92vh-60px)] relative overflow-hidden bg-[#181916]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-xs text-[#b5b3a8] animate-pulse">
              <Loader2 className="h-6 w-6 animate-spin text-[#6b8048]" />
              <span>Streaming secure preview from Supabase...</span>
            </div>
          ) : errorMsg ? (
            <div className="p-8 text-center space-y-2">
              <FileText className="h-8 w-8 text-destructive mx-auto" />
              <p className="text-xs text-[#e7e6df]">{errorMsg}</p>
            </div>
          ) : activeUrl ? (
            <NativePDFCanvas url={activeUrl} />
          ) : (
            <div className="text-xs text-[#b5b3a8]">No preview available</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

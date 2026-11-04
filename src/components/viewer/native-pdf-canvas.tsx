"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Loader2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NativePDFCanvasProps {
  url: string;
}

export function NativePDFCanvas({ url }: NativePDFCanvasProps) {
  const [numPages, setNumPages] = React.useState<number>(0);
  const [pageNumber, setPageNumber] = React.useState<number>(1);
  const [scale, setScale] = React.useState<number>(1.25);
  const [rotation, setRotation] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const pdfDocRef = React.useRef<any>(null);

  // Initialize PDF.js
  React.useEffect(() => {
    let isCancelled = false;

    async function loadPdf() {
      setIsLoading(true);
      setErrorMsg(null);

      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const loadingTask = pdfjsLib.getDocument({
          url,
          withCredentials: false,
        });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        pdfDocRef.current = doc;
        setNumPages(doc.numPages);
        setPageNumber(1);
        setIsLoading(false);
      } catch (err: any) {
        if (!isCancelled) {
          console.error("PDF render error:", err);
          setErrorMsg(err.message || "Failed to parse PDF pages");
          setIsLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [url]);

  // Render current page to HTML5 Canvas
  React.useEffect(() => {
    let renderTask: any = null;

    async function renderPage() {
      if (!pdfDocRef.current || !canvasRef.current) return;

      try {
        const page = await pdfDocRef.current.getPage(pageNumber);
        const viewport = page.getViewport({ scale, rotation });

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport,
        };

        renderTask = page.render(renderContext);
        await renderTask.promise;
      } catch (e: any) {
        if (e?.name !== "RenderingCancelledException") {
          console.warn("Canvas render notice:", e);
        }
      }
    }

    renderPage();

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pageNumber, scale, rotation, numPages]);

  return (
    <div className="flex flex-col h-full w-full bg-[#181916] text-[#e7e6df]">
      {/* Mindful Wabi-Sabi Custom Navigation Ribbon */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-[#2e302b] bg-[#1d1f1b]/95 backdrop-blur select-none z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="h-8 w-8 p-0 text-[#e7e6df] hover:bg-[#2e302b]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-xs font-mono tracking-wide text-[#b5b3a8]">
            Page <span className="text-[#e7e6df] font-semibold">{pageNumber}</span> of{" "}
            <span className="text-[#e7e6df]">{numPages || "–"}</span>
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            className="h-8 w-8 p-0 text-[#e7e6df] hover:bg-[#2e302b]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom & Rotation Controls */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setScale((s) => Math.max(0.75, s - 0.2))}
            className="h-8 w-8 p-0 text-[#e7e6df] hover:bg-[#2e302b]"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs font-mono w-14 text-center text-[#b5b3a8]">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
            className="h-8 w-8 p-0 text-[#e7e6df] hover:bg-[#2e302b]"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <div className="h-4 w-[1px] bg-[#2e302b] mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="h-8 w-8 p-0 text-[#e7e6df] hover:bg-[#2e302b]"
            title="Rotate clockwise"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Document View Canvas Area */}
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-xs text-[#b5b3a8] animate-pulse">
            <Loader2 className="h-7 w-7 animate-spin text-[#6b8048]" />
            <span>Rendering high-fidelity pages...</span>
          </div>
        ) : errorMsg ? (
          <div className="text-center p-8 space-y-2">
            <FileText className="h-8 w-8 text-destructive mx-auto" />
            <p className="text-xs text-[#e7e6df]">{errorMsg}</p>
          </div>
        ) : (
          <div className="rounded-lg shadow-2xl overflow-hidden border border-[#2e302b] bg-white transition-transform">
            <canvas ref={canvasRef} className="block" />
          </div>
        )}
      </div>
    </div>
  );
}

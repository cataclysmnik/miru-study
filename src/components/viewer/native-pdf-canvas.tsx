"use client";

import * as React from "react";
import {
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

interface PageItem {
  pageNumber: number;
}

export function NativePDFCanvas({ url }: NativePDFCanvasProps) {
  const [numPages, setNumPages] = React.useState<number>(0);
  const [scale, setScale] = React.useState<number>(1.25);
  const [rotation, setRotation] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const containerRef = React.useRef<HTMLDivElement | null>(null);
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
        setIsLoading(false);
      } catch (err: any) {
        if (!isCancelled) {
          console.error("PDF load error:", err);
          setErrorMsg(err.message || "Failed to parse PDF document");
          setIsLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [url]);

  return (
    <div className="flex flex-col h-full w-full bg-card text-foreground">
      {/* Mindful Sticky Navigation & Zoom Ribbon */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-border bg-card/95 backdrop-blur select-none z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono tracking-wide text-muted-foreground">
            Total Pages: <span className="text-foreground font-semibold">{numPages || "–"}</span>
          </span>
          <span className="text-[11px] text-muted-foreground/80 hidden sm:inline">
            • Scroll continuously to read
          </span>
        </div>

        {/* Zoom & Rotation Controls */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setScale((s) => Math.max(0.6, Number((s - 0.15).toFixed(2))))}
            className="h-8 w-8 p-0 text-foreground hover:bg-muted"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs font-mono w-14 text-center text-muted-foreground">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setScale((s) => Math.min(2.5, Number((s + 0.15).toFixed(2))))}
            className="h-8 w-8 p-0 text-foreground hover:bg-muted"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <div className="h-4 w-[1px] bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="h-8 w-8 p-0 text-foreground hover:bg-muted"
            title="Rotate clockwise"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Document Vertical Continuous Scroll View Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-8 flex flex-col items-center gap-6 bg-muted/40"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center my-auto py-24 gap-3 text-xs text-muted-foreground animate-pulse">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <span>Rendering high-fidelity pages...</span>
          </div>
        ) : errorMsg ? (
          <div className="text-center p-8 space-y-2 my-auto">
            <FileText className="h-8 w-8 text-destructive mx-auto" />
            <p className="text-xs text-foreground">{errorMsg}</p>
          </div>
        ) : (
          Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
            <PDFPageCanvas
              key={`pdf-page-${pageNum}`}
              pdfDoc={pdfDocRef.current}
              pageNumber={pageNum}
              scale={scale}
              rotation={rotation}
              containerWidth={containerRef.current?.clientWidth}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface PDFPageCanvasProps {
  pdfDoc: any;
  pageNumber: number;
  scale: number;
  rotation: number;
  containerWidth?: number;
}

function PDFPageCanvas({
  pdfDoc,
  pageNumber,
  scale,
  rotation,
}: PDFPageCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [rendered, setRendered] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  // Lazy render using IntersectionObserver for smooth performance on multi-page PDFs
  React.useEffect(() => {
    if (!wrapperRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      {
        rootMargin: "300px 0px 300px 0px", // pre-render when 300px away
      }
    );

    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!pdfDoc || !canvasRef.current || !isInView) return;

    let renderTask: any = null;
    let isCancelled = false;

    async function renderPage() {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale, rotation });
        const canvas = canvasRef.current;
        if (!canvas) return;

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
        if (!isCancelled) {
          setRendered(true);
        }
      } catch (e: any) {
        if (e?.name !== "RenderingCancelledException") {
          console.warn(`Render error page ${pageNumber}:`, e);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, pageNumber, scale, rotation, isInView]);

  return (
    <div
      ref={wrapperRef}
      className="flex flex-col items-center relative group"
    >
      <div className="rounded-xl shadow-lg border border-border bg-white overflow-hidden transition-all duration-150">
        <canvas ref={canvasRef} className="block max-w-full h-auto" />
      </div>
      <div className="mt-2 text-[11px] font-mono text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">
        Page {pageNumber}
      </div>
    </div>
  );
}

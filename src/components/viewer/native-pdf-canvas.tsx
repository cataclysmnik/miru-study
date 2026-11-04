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

export function NativePDFCanvas({ url }: NativePDFCanvasProps) {
  const [numPages, setNumPages] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [scale, setScale] = React.useState<number>(1.25);
  const [rotation, setRotation] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const pdfDocRef = React.useRef<any>(null);
  const pageRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());

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

  // Track active page based on scroll position in container
  const handleScroll = React.useCallback(() => {
    if (!containerRef.current || numPages === 0) return;
    const containerTop = containerRef.current.getBoundingClientRect().top;

    let bestPage = 1;
    let minDistance = Infinity;

    pageRefs.current.forEach((el, pageNum) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dist = Math.abs(rect.top - containerTop - 40);
      if (dist < minDistance) {
        minDistance = dist;
        bestPage = pageNum;
      }
    });

    setCurrentPage(bestPage);
  }, [numPages]);

  return (
    <div className="flex flex-col h-full w-full bg-card text-foreground">
      {/* Mindful Navigation Ribbon */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-border bg-card select-none z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono tracking-wide text-muted-foreground">
            Page <span className="text-foreground font-semibold">{currentPage}</span> of{" "}
            <span className="text-foreground">{numPages || "–"}</span>
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

      {/* Document Vertical Continuous Scroll View Area with Page Indicator */}
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full w-full overflow-y-auto overflow-x-auto p-4 sm:p-8 flex flex-col items-center gap-6 bg-muted/40 scroll-smooth [scrollbar-gutter:stable]"
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
                registerRef={(el) => {
                  if (el) pageRefs.current.set(pageNum, el);
                  else pageRefs.current.delete(pageNum);
                }}
              />
            ))
          )}
        </div>

        {/* Floating Page Pill Indicator */}
        {numPages > 1 && !isLoading && (
          <div className="absolute bottom-5 right-6 pointer-events-none z-20">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/90 border border-border shadow-md text-xs font-mono text-muted-foreground backdrop-blur-xs">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>
                {currentPage} / {numPages}
              </span>
            </div>
          </div>
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
  registerRef?: (el: HTMLDivElement | null) => void;
}

function PDFPageCanvas({
  pdfDoc,
  pageNumber,
  scale,
  rotation,
  registerRef,
}: PDFPageCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isInView, setIsInView] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (registerRef && wrapperRef.current) {
      registerRef(wrapperRef.current);
    }
  }, [registerRef]);

  // Lazy render using IntersectionObserver for smooth performance
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
        rootMargin: "300px 0px 300px 0px",
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

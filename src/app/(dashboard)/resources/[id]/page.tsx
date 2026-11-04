"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Save,
  Download,
  BookOpen,
  Copy,
  Check,
  Clock,
  Printer,
  Sparkles,
} from "lucide-react";
import { useAI } from "@/components/ai-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Dynamically import BlockNote to prevent SSR window issues
const BlockNoteDocumentEditor = dynamic(
  () =>
    import("@/components/editor/blocknote-editor").then(
      (mod) => mod.BlockNoteDocumentEditor
    ),
  { ssr: false, loading: () => <div className="p-8 text-xs text-muted-foreground animate-pulse">Loading BlockNote TipTap Editor...</div> }
);

export default function ResourceEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { resources } = useAI();

  const resourceId = params.id as string;
  const resource = resources.find((r) => r.id === resourceId) || resources[0];

  const [content, setContent] = React.useState(resource?.contentMarkdown || "");
  const [saveStatus, setSaveStatus] = React.useState<"saved" | "saving">("saved");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (resource) {
      setContent(resource.contentMarkdown);
    }
  }, [resource]);

  const handleEditorMarkdownChange = (newMarkdown: string) => {
    setContent(newMarkdown);
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
    }, 800);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    window.print();
  };

  if (!resource) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">Resource Not Found</h2>
        <Link href="/resources">
          <Button variant="outline">Back to Library</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Editor Header Navigation & Save Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/resources"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <Badge variant="subtle" className="text-[10px] font-mono">
                {resource.courseCode}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {resource.resourceType.replace("_", " ")}
              </Badge>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {saveStatus === "saving" ? "Autosaving..." : "Saved to Workspace"}
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-foreground mt-1">
              {resource.title}
            </h1>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyMarkdown}
            className="gap-1.5 text-xs"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied" : "Copy Markdown"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="gap-1.5 text-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Grounded Citation Badge Banner */}
      {resource.citations && resource.citations.length > 0 && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground">
          <BookOpen className="h-4 w-4 text-primary shrink-0" />
          <span className="font-medium text-foreground">
            Grounded Reference:
          </span>
          <span className="truncate">
            {resource.citations[0].title}
            {resource.citations[0].page && ` (page ${resource.citations[0].page})`}
          </span>
        </div>
      )}

      {/* BlockNote Document Canvas */}
      <div className="rounded-2xl border border-border bg-card shadow-sm p-4 sm:p-8 min-h-[600px]">
        <BlockNoteDocumentEditor
          initialMarkdown={resource.contentMarkdown}
          onChangeMarkdown={handleEditorMarkdownChange}
        />
      </div>
    </div>
  );
}

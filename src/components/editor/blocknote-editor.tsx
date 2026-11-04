"use client";

import * as React from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useTheme } from "next-themes";

interface BlockNoteEditorProps {
  initialMarkdown?: string;
  onChangeMarkdown?: (markdown: string) => void;
}

export function BlockNoteDocumentEditor({
  initialMarkdown,
  onChangeMarkdown,
}: BlockNoteEditorProps) {
  const { theme } = useTheme();

  const editor = useCreateBlockNote({
    initialContent: undefined,
  });

  React.useEffect(() => {
    async function loadInitialMarkdown() {
      if (editor && initialMarkdown) {
        try {
          const blocks = await editor.tryParseMarkdownToBlocks(initialMarkdown);
          editor.replaceBlocks(editor.document, blocks);
        } catch (e) {
          console.error("Failed to parse markdown to BlockNote blocks", e);
        }
      }
    }
    loadInitialMarkdown();
  }, [editor, initialMarkdown]);

  const handleEditorChange = async () => {
    if (editor && onChangeMarkdown) {
      try {
        const markdown = await editor.blocksToMarkdownLossy(editor.document);
        onChangeMarkdown(markdown);
      } catch (e) {
        console.error("Failed to convert blocks to markdown", e);
      }
    }
  };

  return (
    <div className="w-full min-h-[500px] text-foreground rounded-xl">
      <BlockNoteView
        editor={editor}
        theme={theme === "dark" ? "dark" : "light"}
        onChange={handleEditorChange}
      />
    </div>
  );
}


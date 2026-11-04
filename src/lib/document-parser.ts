import mammoth from "mammoth";

export interface ExtractedDocument {
  text: string;
  pageCount?: number;
  metadata?: Record<string, any>;
}

export async function extractDocumentText(
  buffer: Buffer,
  fileName: string
): Promise<ExtractedDocument> {
  const ext = fileName.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "txt":
    case "md":
    case "markdown": {
      const text = buffer.toString("utf-8");
      return { text };
    }

    case "docx": {
      const result = await mammoth.extractRawText({ buffer });
      return { text: result.value };
    }

    case "pdf": {
      try {
        const pdfParseModule = await import("pdf-parse");
        const pdfParse = (pdfParseModule as any).default || pdfParseModule;
        const data = await pdfParse(buffer);
        return {
          text: data.text || "",
          pageCount: data.numpages || 1,
          metadata: data.info || {},
        };
      } catch (err) {
        console.warn("PDF parse fallback:", err);
        return {
          text: buffer.toString("utf-8", 0, Math.min(buffer.length, 50000)),
          pageCount: 1,
        };
      }
    }

    default: {
      const text = buffer.toString("utf-8");
      return { text };
    }
  }
}

export interface ChunkItem {
  chunkIndex: number;
  content: string;
  heading?: string;
  pageNumber?: number;
  tokenCount: number;
}

export function chunkText(
  text: string,
  chunkSize: number = 700,
  overlap: number = 100
): ChunkItem[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: ChunkItem[] = [];
  let currentChunk: string[] = [];
  let currentTokens = 0;
  let chunkIdx = 0;

  for (const para of paragraphs) {
    const cleanPara = para.trim();
    if (!cleanPara) continue;

    const approxTokens = Math.ceil(cleanPara.length / 4);

    if (currentTokens + approxTokens > chunkSize && currentChunk.length > 0) {
      const content = currentChunk.join("\n\n");
      chunks.push({
        chunkIndex: chunkIdx++,
        content,
        tokenCount: currentTokens,
      });

      currentChunk = [cleanPara];
      currentTokens = approxTokens;
    } else {
      currentChunk.push(cleanPara);
      currentTokens += approxTokens;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push({
      chunkIndex: chunkIdx,
      content: currentChunk.join("\n\n"),
      tokenCount: currentTokens,
    });
  }

  return chunks;
}

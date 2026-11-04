import { NextRequest, NextResponse } from "next/server";
import { extractDocumentText, chunkText } from "@/lib/document-parser";
import { supabaseServerAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const courseId = formData.get("courseId") as string | null;
    const moduleId = formData.get("moduleId") as string | null;
    const title = formData.get("title") as string | null;
    const userId = formData.get("userId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Extract raw text and metadata based on file extension
    const extracted = await extractDocumentText(buffer, file.name);

    // 2. Perform semantic paragraph chunking
    const chunks = chunkText(extracted.text);

    // 3. Upload raw file to Supabase Storage Bucket ('academic-materials')
    const storagePath = `${userId || "anonymous"}/${courseId || "general"}/${Date.now()}-${file.name}`;
    
    let storageUploaded = false;
    try {
      const { error: storageError } = await supabaseServerAdmin.storage
        .from("academic-materials")
        .upload(storagePath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

      if (!storageError) {
        storageUploaded = true;
      }
    } catch (e) {
      console.warn("Storage upload warning (proceeding with text extraction):", e);
    }

    // 4. Insert study material record into Supabase Database if courseId provided
    let materialId = `mat-${Date.now()}`;
    if (userId && courseId) {
      try {
        const { data: matRecord } = await supabaseServerAdmin
          .from("study_materials")
          .insert({
            user_id: userId,
            course_id: courseId,
            module_id: moduleId && moduleId !== "unassigned" ? moduleId : null,
            title: title || file.name,
            storage_path: storagePath,
            file_type: file.name.split(".").pop()?.toLowerCase() || "pdf",
            file_size_bytes: file.size,
            page_count: extracted.pageCount || 1,
            status: "indexed",
          })
          .select("id")
          .single();

        if (matRecord) {
          materialId = matRecord.id;

          // Insert document chunks for RAG
          const chunkInserts = chunks.map((c) => ({
            user_id: userId,
            course_id: courseId,
            material_id: materialId,
            module_id: moduleId && moduleId !== "unassigned" ? moduleId : null,
            chunk_index: c.chunkIndex,
            content: c.content,
            token_count: c.tokenCount,
          }));

          await supabaseServerAdmin.from("document_chunks").insert(chunkInserts);
        }
      } catch (dbErr) {
        console.warn("Database insertion warning:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      materialId,
      storageUploaded,
      fileName: file.name,
      pageCount: extracted.pageCount || 1,
      totalChunks: chunks.length,
      samplePreview: chunks[0]?.content.slice(0, 300) || "",
    });
  } catch (error: any) {
    console.error("Upload & Extraction error:", error);
    return NextResponse.json(
      { error: error?.message || "Document extraction failed" },
      { status: 500 }
    );
  }
}

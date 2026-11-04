import { NextRequest, NextResponse } from "next/server";
import { extractDocumentText } from "@/lib/document-parser";
import { callGemini } from "@/lib/gemini";
import { supabaseServerAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const manualText = formData.get("text") as string | null;
    const courseId = formData.get("courseId") as string | null;
    const courseName = formData.get("courseName") as string | null;
    const userId = formData.get("userId") as string | null;
    const byokKey = formData.get("byokKey") as string | null;

    let extractedText = manualText || "";
    let inlineFile: { mimeType: string; data: string } | undefined = undefined;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());

      // If PDF, pass both native inline PDF bytes to Gemini multimodal AND extracted text
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        inlineFile = {
          mimeType: "application/pdf",
          data: buffer.toString("base64"),
        };
      }

      const extracted = await extractDocumentText(buffer, file.name);
      extractedText = extracted.text;
    }

    if (!extractedText.trim() && !inlineFile) {
      return NextResponse.json(
        { error: "No text or file provided for syllabus extraction" },
        { status: 400 }
      );
    }

    const extractionPrompt = `You are a precision academic curriculum parser.
Examine this complete course syllabus document for "${courseName || "Academic Course"}".

INSTRUCTIONS:
1. Scan the ENTIRE document from start to end (especially looking across all pages, tables, and sections like Module 1, Module 2, Module 3, Module 4, Module 5, Module 6, Module 7, Module 8, etc.).
2. You must NOT stop early or truncate the end. Capture EVERY module listed in the curriculum table.
3. For each module, extract:
   - "title": Clean title (e.g. "Module 1: Introduction to Autonomous Drones")
   - "hours": The hours or weightage if stated (e.g. "4 hours", "3 hours", "5 hours", "2 hours")
   - "topics": An array of individual topics. Break down comma-separated or dash-separated phrases into distinct topics.
   - "description": Brief 1-line concept summary.

Return a pure JSON array with no extra text or markdown formatting:
[
  {
    "title": "Module 1: Introduction to Autonomous Drones",
    "hours": "4 hours",
    "description": "Foundations and component overview",
    "topics": ["History of Drones", "Types of drones", "Airframe", "Batteries", "Motors", "ESC: Electronic Speed Controller", "Propellers"]
  }
]

Extracted text reference (if applicable):
${extractedText.slice(0, 50000)}
`;

    const rawJsonText = await callGemini(
      extractionPrompt,
      "gemini-flash-latest",
      byokKey || undefined,
      {
        maxOutputTokens: 8192,
        temperature: 0.1,
        responseMimeType: "application/json",
      },
      inlineFile
    );

    const cleanJson = rawJsonText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const modulesData: Array<{
      title: string;
      description?: string;
      hours?: string;
      topics: Array<string | { title: string; subtopics?: string[] }>;
    }> = JSON.parse(cleanJson);

    // Save ALL extracted modules & topics atomically into Supabase
    if (userId && courseId && modulesData.length > 0) {
      const { data: syllabus } = await supabaseServerAdmin
        .from("syllabi")
        .select("id")
        .eq("course_id", courseId)
        .eq("user_id", userId)
        .order("version", { ascending: false })
        .limit(1)
        .single();

      let syllabusId = syllabus?.id;
      if (!syllabusId) {
        const { data: newSyl } = await supabaseServerAdmin
          .from("syllabi")
          .insert({
            user_id: userId,
            course_id: courseId,
            version: 1,
            is_active: true,
            extraction_status: "completed",
          })
          .select("id")
          .single();
        syllabusId = newSyl?.id;
      }

      if (syllabusId) {
        // Clear previous modules to avoid duplicates
        const { data: existingMods } = await supabaseServerAdmin
          .from("syllabus_modules")
          .select("id")
          .eq("syllabus_id", syllabusId);

        if (existingMods && existingMods.length > 0) {
          const modIds = existingMods.map((m) => m.id);
          await supabaseServerAdmin.from("syllabus_topics").delete().in("module_id", modIds);
          await supabaseServerAdmin.from("syllabus_modules").delete().in("id", modIds);
        }

        // Insert every extracted module and all its constituent topics
        for (let i = 0; i < modulesData.length; i++) {
          const mod = modulesData[i];
          const { data: insertedMod } = await supabaseServerAdmin
            .from("syllabus_modules")
            .insert({
              user_id: userId,
              syllabus_id: syllabusId,
              order_index: i + 1,
              title: mod.title,
              description: mod.description || null,
              hours_or_weightage: mod.hours || null,
            })
            .select("id")
            .single();

          if (insertedMod && mod.topics && Array.isArray(mod.topics)) {
            const topicInserts = mod.topics.map((t, tIdx) => {
              const topicTitle = typeof t === "string" ? t : t.title;
              return {
                user_id: userId,
                module_id: insertedMod.id,
                order_index: tIdx + 1,
                title: topicTitle.trim(),
              };
            });

            if (topicInserts.length > 0) {
              await supabaseServerAdmin.from("syllabus_topics").insert(topicInserts);
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalModules: modulesData.length,
      modules: modulesData,
    });
  } catch (err: any) {
    console.error("Syllabus extraction error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to extract syllabus" },
      { status: 500 }
    );
  }
}

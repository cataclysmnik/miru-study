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

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const extracted = await extractDocumentText(buffer, file.name);
      extractedText = extracted.text;
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: "No text or file provided for syllabus extraction" },
        { status: 400 }
      );
    }

    // Prompt specifically instructing extraction of both modules AND their constituent topics
    const extractionPrompt = `You are an expert academic curriculum parser.
Analyze this official course syllabus document for "${courseName || "Academic Course"}":

--- SYLLABUS DOCUMENT ---
${extractedText.slice(0, 25000)}
-------------------------

Carefully extract EVERY Module and its individual constituent topics.
In typical university syllabi, each module contains multiple topics separated by dashes (- or –), commas, or semicolons. Break each module's content into separate clean topic titles.

Return ONLY a valid JSON array matching this exact schema with NO backticks and NO other text:
[
  {
    "title": "Module 1: Introduction to Autonomous Drones",
    "description": "Foundations, types, and drone components",
    "hours": "4 hours",
    "topics": [
      "History of Drones",
      "Types of drones",
      "Airframe",
      "Batteries",
      "Motors",
      "ESC: Electronic Speed Controller",
      "Propellers"
    ]
  }
]`;

    let rawJsonText = "";
    try {
      rawJsonText = await callGemini(
        extractionPrompt,
        "gemini-flash-latest",
        byokKey || undefined
      );
    } catch (apiErr) {
      console.warn("Gemini syllabus extraction fallback:", apiErr);
      throw apiErr;
    }

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

    // If userId and courseId are provided, atomically save modules & topics into Supabase
    if (userId && courseId && modulesData.length > 0) {
      // Find syllabus id for this course
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
        // Clear previous empty modules if re-uploading
        const { data: existingMods } = await supabaseServerAdmin
          .from("syllabus_modules")
          .select("id")
          .eq("syllabus_id", syllabusId);

        if (existingMods && existingMods.length > 0) {
          const modIds = existingMods.map((m) => m.id);
          await supabaseServerAdmin.from("syllabus_topics").delete().in("module_id", modIds);
          await supabaseServerAdmin.from("syllabus_modules").delete().in("id", modIds);
        }

        // Insert fresh modules and their topics
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

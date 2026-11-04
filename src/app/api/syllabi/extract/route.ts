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

    // Force extraction of ALL modules without early stopping
    const extractionPrompt = `You are an expert academic curriculum parser.
Analyze this official syllabus document for "${courseName || "Academic Course"}":

--- FULL SYLLABUS TEXT ---
${extractedText.slice(0, 35000)}
--------------------------

CRITICAL REQUIREMENTS:
1. You MUST extract EVERY SINGLE MODULE present in the syllabus (e.g. Module 1, Module 2, Module 3, Module 4, Module 5, Module 6, Module 7, Module 8, etc.). Do NOT omit or truncate any modules.
2. For each module, break apart its text into discrete constituent topics (split by dashes, commas, bullets, or semicolons).
3. Extract the lecture hours / weightage if stated (e.g. "4 hours", "3 hours", "5 hours").

Return ONLY a valid JSON array of ALL modules matching this exact schema, with NO markdown backticks and NO other text:
[
  {
    "title": "Module 1: Introduction to Autonomous Drones",
    "description": "Foundations and component overview",
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
  },
  {
    "title": "Module 2: Design Fundamentals",
    "description": "Controllers and transmission systems",
    "hours": "3 hours",
    "topics": [
      "Flight Controllers",
      "RC Transmitters",
      "FPV Systems",
      "Telemetry",
      "Timing Gates"
    ]
  }
]`;

    const rawJsonText = await callGemini(
      extractionPrompt,
      "gemini-flash-latest",
      byokKey || undefined
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

    // Save ALL extracted modules & topics atomically to Supabase
    if (userId && courseId && modulesData.length > 0) {
      // Find or create syllabus id for this course
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

        // Insert every extracted module and its topics
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

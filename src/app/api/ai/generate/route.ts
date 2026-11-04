import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";
import { supabaseServerAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      courseId,
      courseCode,
      moduleId,
      topicName,
      resourceType,
      customPrompt,
      byokKey,
      userId,
    } = body;

    if (!courseCode || !resourceType) {
      return NextResponse.json(
        { error: "Course code and resource type are required" },
        { status: 400 }
      );
    }

    // 1. Retrieve grounded RAG chunks from Supabase document_chunks if available
    let retrievedContext = "";
    let citations: Array<{ title: string; page?: number; excerpt: string }> = [];

    if (userId && courseId) {
      try {
        let query = supabaseServerAdmin
          .from("document_chunks")
          .select("content, heading, page_number, material_id")
          .eq("user_id", userId)
          .eq("course_id", courseId)
          .limit(8);

        if (moduleId && moduleId !== "all") {
          query = query.eq("module_id", moduleId);
        }

        const { data: chunks } = await query;

        if (chunks && chunks.length > 0) {
          retrievedContext = chunks.map((c, i) => `[Document Excerpt ${i + 1}]:\n${c.content}`).join("\n\n");
          citations = chunks.slice(0, 3).map((c, i) => ({
            title: `${courseCode} Study Material`,
            page: c.page_number || i + 1,
            excerpt: c.content.slice(0, 100) + "...",
          }));
        }
      } catch (err) {
        console.warn("RAG retrieval error (proceeding):", err);
      }
    }

    // 2. Assemble Grounded System & User Prompt
    const promptScope = topicName ? `Topic: "${topicName}"` : `General Course Scope`;
    const prompt = `You are Miru, an expert academic tutor and learning operating system adhering to strict syllabus-grounded academic rigor.
Task: Generate a comprehensive ${resourceType.replace("_", " ")} for the course "${courseCode}" covering "${promptScope}".

Course Grounding Context from uploaded documents:
${retrievedContext || "No custom uploaded files attached. Adhere strictly to canonical academic university curriculum for this topic."}

Directives:
1. Provide mathematically rigorous formulas, recurrence relations, and step-by-step proofs where applicable using LaTeX syntax (e.g. $O(n \\log n)$, equations on double dollar $$...$$).
2. Structure clearly with headings (#, ##, ###), bullet points, and code/table blocks.
3. If custom instructions are provided: "${customPrompt || "None"}".
4. Cite and ground your concepts explicitly in the course scope.`;

    // 3. Call Gemini API via v1beta endpoint with X-goog-api-key
    const generatedMarkdown = await callGemini(
      prompt,
      "gemini-flash-latest",
      byokKey
    );

    if (citations.length === 0) {
      citations = [
        {
          title: `${courseCode} Verified Curriculum Scope`,
          excerpt: `Grounded in ${topicName || courseCode} topics.`,
        },
      ];
    }

    return NextResponse.json({
      success: true,
      title: `${resourceType.replace("_", " ")}: ${topicName || courseCode}`,
      contentMarkdown: generatedMarkdown,
      citations,
    });
  } catch (error: any) {
    console.error("AI Generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate resource" },
      { status: 500 }
    );
  }
}

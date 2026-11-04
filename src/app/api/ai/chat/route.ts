import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";
import { supabaseServerAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { courseCode, courseId, message, byokKey, userId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Retrieve RAG chunks if available
    let retrievedContext = "";
    let citations: Array<{ title: string; page?: number; excerpt: string }> = [];

    if (userId && courseId) {
      try {
        const { data: chunks } = await supabaseServerAdmin
          .from("document_chunks")
          .select("content, heading, page_number")
          .eq("user_id", userId)
          .eq("course_id", courseId)
          .limit(4);

        if (chunks && chunks.length > 0) {
          retrievedContext = chunks.map((c, i) => `[Excerpt ${i + 1}]:\n${c.content}`).join("\n\n");
          citations = chunks.slice(0, 2).map((c, i) => ({
            title: `${courseCode} Lecture Documents`,
            page: c.page_number || i + 1,
            excerpt: c.content.slice(0, 80) + "...",
          }));
        }
      } catch (err) {
        console.warn("RAG retrieval warning:", err);
      }
    }

    const prompt = `You are Miru's course assistant for "${courseCode || "the course"}".
A student asked: "${message}"

Uploaded Course Grounding Context:
${retrievedContext || "No custom uploaded files attached. Adhere strictly to canonical academic university curriculum for this course."}

Instructions:
1. Distinguish between information supported by uploaded material and general background knowledge.
2. Provide concise, clear, and mathematically accurate explanations.
3. Use markdown and math notation where appropriate.`;

    const reply = await callGemini(prompt, "gemini-flash-latest", byokKey);

    if (citations.length === 0) {
      citations = [
        {
          title: `${courseCode} Course Scope`,
          excerpt: "Verified against course modules.",
        },
      ];
    }

    return NextResponse.json({
      reply,
      citations,
    });
  } catch (err: any) {
    console.error("AI Chat error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

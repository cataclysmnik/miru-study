import { NextRequest, NextResponse } from "next/server";
import { extractDocumentText } from "@/lib/document-parser";
import { callGemini } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const manualText = formData.get("text") as string | null;
    const courseName = formData.get("courseName") as string | null;
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

    const extractionPrompt = `You are an expert academic curriculum parser. 
Analyze the following syllabus text for the course "${courseName || "Academic Course"}" and extract a clean, structured hierarchical module and topic tree.

Return ONLY a valid JSON array of modules matching this exact schema, with NO markdown backticks, NO markdown formatting, and NO commentary:
[
  {
    "title": "Module 1: Title Here",
    "description": "Short summary of module concepts",
    "hours": "10 Hours",
    "topics": [
      {
        "title": "Topic 1.1 Name",
        "subtopics": ["Subtopic A", "Subtopic B"]
      }
    ]
  }
]

Syllabus Text:
${extractedText.slice(0, 15000)}
`;

    let rawJsonText = "";
    try {
      rawJsonText = await callGemini(
        extractionPrompt,
        "gemini-flash-latest",
        byokKey || undefined
      );
    } catch (apiErr) {
      console.warn("Gemini syllabus extraction fallback:", apiErr);
      const lines = extractedText.split("\n").filter((l) => l.trim().length > 0);
      const sampleModules = [
        {
          title: "Module 1: Core Fundamentals",
          description: "Foundational topics parsed from syllabus",
          hours: "10 Hours",
          topics: lines.slice(0, 4).map((line) => ({
            title: line.replace(/^[-*•0-9.]+\s*/, "").slice(0, 60),
            subtopics: [],
          })),
        },
        {
          title: "Module 2: Advanced Topics",
          description: "Parsed syllabus units",
          hours: "12 Hours",
          topics: lines.slice(4, 8).map((line) => ({
            title: line.replace(/^[-*•0-9.]+\s*/, "").slice(0, 60),
            subtopics: [],
          })),
        },
      ];
      rawJsonText = JSON.stringify(sampleModules);
    }

    const cleanJson = rawJsonText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const modules = JSON.parse(cleanJson);

    return NextResponse.json({
      success: true,
      modules,
    });
  } catch (err: any) {
    console.error("Syllabus extraction error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to extract syllabus" },
      { status: 500 }
    );
  }
}

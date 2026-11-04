import { NextRequest, NextResponse } from "next/server";
import { extractDocumentText } from "@/lib/document-parser";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const manualText = formData.get("text") as string | null;
    const courseName = formData.get("courseName") as string | null;
    const byokKey = formData.get("byokKey") as string | null;
    const byokProvider = formData.get("byokProvider") as string | null;

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

    // AI prompt to extract structured modules and topics JSON
    const extractionPrompt = `You are an expert academic curriculum parser. 
Analyze the following syllabus text for the course "${courseName || "Academic Course"}" and extract a clean, structured hierarchical module and topic tree.

Return ONLY a valid JSON array of modules matching this exact schema, with NO markdown backticks or commentary:
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

    if (byokProvider === "gemini" && byokKey) {
      const ai = new GoogleGenAI({ apiKey: byokKey });
      const resp = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: extractionPrompt,
      });
      rawJsonText = resp.text || "[]";
    } else if (byokProvider === "openai" && byokKey) {
      const openai = new OpenAI({ apiKey: byokKey });
      const resp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: extractionPrompt }],
      });
      rawJsonText = resp.choices[0]?.message.content || "[]";
    } else if (process.env.PLATFORM_AI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.PLATFORM_AI_API_KEY });
      const resp = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: extractionPrompt,
      });
      rawJsonText = resp.text || "[]";
    } else {
      // Fallback structural parsing if no AI key configured
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
          title: "Module 2: Advanced Applications",
          description: "Practical implementations and analysis",
          hours: "12 Hours",
          topics: lines.slice(4, 8).map((line) => ({
            title: line.replace(/^[-*•0-9.]+\s*/, "").slice(0, 60),
            subtopics: [],
          })),
        },
      ];
      rawJsonText = JSON.stringify(sampleModules);
    }

    // Clean JSON response
    const cleanJson = rawJsonText.replace(/```json/g, "").replace(/```/g, "").trim();
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

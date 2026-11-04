import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const courseId = formData.get("courseId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        status: "indexed",
        extractedChunks: 24,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Extraction failed" },
      { status: 500 }
    );
  }
}

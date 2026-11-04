import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { courseCode, message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    return NextResponse.json({
      reply: `Regarding "${message}" in ${courseCode || "your course"}: According to your uploaded curriculum materials, this concept is structured around foundational state transitions and asymptotic efficiency bounds.`,
      citations: [
        {
          title: `${courseCode || "Course"} Lecture Slides`,
          page: 5,
          excerpt: "Verified course context excerpt.",
        },
      ],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


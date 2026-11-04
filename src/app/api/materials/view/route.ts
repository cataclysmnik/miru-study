import { NextRequest, NextResponse } from "next/server";
import { supabaseServerAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storagePath = searchParams.get("path");

    if (!storagePath) {
      return NextResponse.json({ error: "Storage path is required" }, { status: 400 });
    }

    // Generate a 1-hour signed URL for private bucket access
    const { data, error } = await supabaseServerAdmin.storage
      .from("academic-materials")
      .createSignedUrl(storagePath, 3600);

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: error?.message || "Failed to create signed URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

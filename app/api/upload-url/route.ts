import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { fileName, contentType } = await req.json();
    if (!fileName || !contentType) {
      return NextResponse.json({ error: "Missing fileName or contentType" }, { status: 400 });
    }

    const db = getServiceClient();
    const path = `photos/${Date.now()}-${Math.random().toString(36).slice(2)}-${fileName}`;

    const { data, error } = await db.storage
      .from("seagull-leads")
      .createSignedUploadUrl(path);

    if (error) {
      console.error("Signed URL error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = db.storage.from("seagull-leads").getPublicUrl(path);

    return NextResponse.json({
      signedUrl: data.signedUrl,
      path,
      publicUrl: urlData.publicUrl,
    });
  } catch (err) {
    console.error("Upload URL error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

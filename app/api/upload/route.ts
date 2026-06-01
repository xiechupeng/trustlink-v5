import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "video/mp4", "video/quicktime"];

async function ensureBucket(db: ReturnType<typeof getServiceClient>) {
  const { data: buckets } = await db.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === "seagull-leads");
  if (!exists) {
    await db.storage.createBucket("seagull-leads", { public: true, fileSizeLimit: MAX_SIZE });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "File type not allowed" }, { status: 400 });

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = await file.arrayBuffer();

    const db = getServiceClient();
    await ensureBucket(db);

    const { data, error } = await db.storage
      .from("seagull-leads")
      .upload(`photos/${fileName}`, buffer, { contentType: file.type });

    if (error) {
      console.error("Storage error:", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: urlData } = db.storage.from("seagull-leads").getPublicUrl(data.path);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

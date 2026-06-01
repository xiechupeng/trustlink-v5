import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

// GET /api/edit-profile?token=xxx — validate token, return profile data
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "缺少 token" }, { status: 400 });

  const db = getServiceClient();
  const { data: profile } = await db
    .from("trustlink_profiles")
    .select("id, category, name, wechat, email, teaser, data, edit_token_expires_at")
    .eq("edit_token", token)
    .maybeSingle();

  if (!profile) return NextResponse.json({ error: "链接无效或已过期" }, { status: 404 });

  const expired = new Date(profile.edit_token_expires_at) < new Date();
  if (expired) return NextResponse.json({ error: "链接已过期，请重新申请" }, { status: 410 });

  return NextResponse.json({ profile });
}

// POST /api/edit-profile — save updated profile, invalidate token
export async function POST(req: NextRequest) {
  try {
    const { token, name, wechat, data } = await req.json();
    if (!token || !wechat) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    const db = getServiceClient();

    // Validate token
    const { data: profile } = await db
      .from("trustlink_profiles")
      .select("id, edit_token_expires_at")
      .eq("edit_token", token)
      .maybeSingle();

    if (!profile) return NextResponse.json({ error: "链接无效" }, { status: 404 });
    if (new Date(profile.edit_token_expires_at) < new Date()) {
      return NextResponse.json({ error: "链接已过期" }, { status: 410 });
    }

    // Build new teaser from updated data
    const teaser: string = data?.background || data?.project || data?.desc || data?.teaser || "";

    // Save + invalidate token (single use)
    const { error } = await db
      .from("trustlink_profiles")
      .update({
        name: name || null,
        wechat,
        data,
        teaser: teaser ? teaser.slice(0, 100) : null,
        edit_token: null,
        edit_token_expires_at: null,
      })
      .eq("id", profile.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("edit-profile save error:", err);
    return NextResponse.json({ error: "保存失败，请重试" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getServiceClient } from "@/lib/supabase";
import { sendTrustLinkEditLink } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "请填写邮箱" }, { status: 400 });
    }

    const db = getServiceClient();

    // Look up ALL profiles for this email (user may have multiple categories)
    const { data: profiles } = await db
      .from("trustlink_profiles")
      .select("id, name, email, category")
      .eq("email", email.trim().toLowerCase());

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ success: true, profiles: [] });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://trustlink-zeta.vercel.app";

    // Generate a token for each profile
    const results = await Promise.all(
      profiles.map(async (p) => {
        const token = randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        await db
          .from("trustlink_profiles")
          .update({ edit_token: token, edit_token_expires_at: expiresAt })
          .eq("id", p.id);
        return { id: p.id, category: p.category, name: p.name, editUrl: `${baseUrl}/edit-profile?token=${token}` };
      })
    );

    // Try email (best effort)
    try {
      await sendTrustLinkEditLink({
        email: profiles[0].email,
        name: profiles[0].name || "",
        editUrl: results[0].editUrl,
      });
    } catch (emailErr) {
      console.warn("Email send failed (non-fatal):", emailErr);
    }

    return NextResponse.json({ success: true, profiles: results });
  } catch (err) {
    console.error("request-edit error:", err);
    return NextResponse.json({ error: "服务器错误，请稍后重试" }, { status: 500 });
  }
}

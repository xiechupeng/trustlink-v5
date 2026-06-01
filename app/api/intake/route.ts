import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { sendOwnerNotification, sendClientConfirmation } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, name, wechat, email, city, description, photoUrl, extraData } = body;

    if (!category || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const submissionData = { category, name, wechat, email, city, description, photoUrl, extraData: extraData || {} };

    // Store in Supabase
    const db = getServiceClient();

    // Build teaser from content fields only (exclude contact fields)
    const extra = extraData || {};
    const EXCLUDE = new Set(["name", "wechat", "email", "phone"]);
    const contentValues = Object.entries(extra)
      .filter(([k]) => !EXCLUDE.has(k))
      .map(([, v]) => v)
      .filter(Boolean);
    const teaser = extra.background || extra.project || extra.desc || contentValues[0] || description || "";

    const { error: dbError } = await db.from("trustlink_profiles").insert({
      category,
      name: name || null,
      wechat,
      email: email || null,
      teaser: teaser ? teaser.slice(0, 100) : null,
      data: { city, description, ...extra },
      approved: false,
    });

    if (dbError) {
      console.error("DB error:", dbError);
      // Don't fail the whole request — still send email
    }

    // Send notifications (parallel)
    await Promise.allSettled([
      sendOwnerNotification(submissionData),
      sendClientConfirmation(submissionData),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Intake error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

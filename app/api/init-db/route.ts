import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET() {
  const db = getServiceClient();

  // Create table via Supabase rpc if it doesn't exist
  const { error } = await db.rpc("create_trustlink_profiles_if_not_exists");

  if (error) {
    // Table might already exist or rpc doesn't exist — try direct insert test
    const { error: testError } = await db
      .from("trustlink_profiles")
      .select("id")
      .limit(1);

    if (testError?.code === "42P01") {
      return NextResponse.json({ error: "Table does not exist. Please run supabase-profiles.sql manually in Supabase dashboard." }, { status: 500 });
    }

    return NextResponse.json({ status: "Table already exists or was created", testError });
  }

  return NextResponse.json({ status: "OK" });
}

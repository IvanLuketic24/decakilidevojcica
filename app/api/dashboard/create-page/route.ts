import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuth } from "@clerk/nextjs/server";

function makeSlug(len = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized (no userId)" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const actual_gender = body?.actual_gender as "boy" | "girl";

  if (actual_gender !== "boy" && actual_gender !== "girl") {
    return NextResponse.json({ error: "Invalid actual_gender" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const slug = makeSlug(10);

  const { error } = await supabase.from("guess_pages").insert({
    slug,
    actual_gender,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ slug });
}
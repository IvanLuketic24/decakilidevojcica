import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

function supabaseServer() {
  return createClient(SUPABASE_URL, SERVICE_ROLE ?? ANON_KEY, {
    auth: { persistSession: false },
  });
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const actual_gender = body?.actual_gender;

    if (actual_gender !== "boy" && actual_gender !== "girl") {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const supabase = supabaseServer();

    const { data: page, error: pageErr } = await supabase
      .from("guess_pages")
      .select("slug")
      .eq("owner_user_id", userId)
      .maybeSingle();

    if (pageErr) return NextResponse.json({ error: pageErr.message }, { status: 500 });
    if (!page?.slug) return NextResponse.json({ error: "Page not found" }, { status: 404 });

    const { error: updErr } = await supabase
      .from("guess_pages")
      .update({ actual_gender })
      .eq("slug", page.slug);

    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("POST /api/dashboard/page/gender crashed:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
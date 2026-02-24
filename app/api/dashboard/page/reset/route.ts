import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

function supabaseServer() {
  // service role ako postoji (preporučeno), inače anon (ako RLS dozvoljava)
  return createClient(SUPABASE_URL, SERVICE_ROLE ?? ANON_KEY, {
    auth: { persistSession: false },
  });
}

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = supabaseServer();

    // 1) nađi moj slug
    const { data: page, error: pageErr } = await supabase
      .from("guess_pages")
      .select("slug")
      .eq("owner_user_id", userId)
      .maybeSingle();

    if (pageErr) {
      return NextResponse.json({ error: pageErr.message }, { status: 500 });
    }

    if (!page?.slug) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const slug = page.slug as string;

    // 2) obriši sve glasove za taj slug
    const { error: delErr } = await supabase
      .from("guess_votes")
      .delete()
      .eq("slug", slug);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("POST /api/dashboard/page/reset crashed:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
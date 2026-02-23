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

function randomSlug() {
  return Math.random().toString(36).slice(2, 10);
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = supabaseServer();

    // 1) find my page
    const { data: existingPage, error: pageErr } = await supabase
      .from("guess_pages")
      .select(
        "slug, actual_gender, owner_user_id, background_url, boy_image_url, girl_image_url"
      )
      .eq("owner_user_id", userId)
      .maybeSingle();

    if (pageErr) {
      return NextResponse.json({ error: pageErr.message }, { status: 500 });
    }

    let page = existingPage;

    // 2) create if missing
    if (!page) {
      const slug = randomSlug();

      // Da ne puca ako ti schema i dalje zahteva NOT NULL:
      const { data: created, error: createErr } = await supabase
        .from("guess_pages")
        .insert({
          slug,
          owner_user_id: userId,
          actual_gender: "girl",
        })
        .select(
          "slug, actual_gender, owner_user_id, background_url, boy_image_url, girl_image_url"
        )
        .single();

      if (createErr) {
        return NextResponse.json({ error: createErr.message }, { status: 500 });
      }

      page = created;
    }

    const slug = page.slug as string;

    // 3) counts
    const { data: votes, error: votesErr } = await supabase
      .from("guess_votes")
      .select("choice")
      .eq("slug", slug);

    if (votesErr) {
      return NextResponse.json({ error: votesErr.message }, { status: 500 });
    }

    const boy = (votes ?? []).filter((v) => v.choice === "boy").length;
    const girl = (votes ?? []).filter((v) => v.choice === "girl").length;
    const total = (votes ?? []).length;

    // 4) voters list
    const { data: voters, error: votersErr } = await supabase
      .from("guess_votes")
      .select("first_name, last_name, choice, created_at")
      .eq("slug", slug)
      .order("created_at", { ascending: false });

    if (votersErr) {
      return NextResponse.json({ error: votersErr.message }, { status: 500 });
    }

    return NextResponse.json({
      slug,
      actual_gender: page.actual_gender,
      counts: { boy, girl, total },
      voters: voters ?? [],
      background_url: page.background_url ?? null,
      boy_image_url: page.boy_image_url ?? null,
      girl_image_url: page.girl_image_url ?? null,
    });
  } catch (e: any) {
    console.error("GET /api/dashboard/page crashed:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
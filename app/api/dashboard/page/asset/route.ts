import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function supabaseAdmin() {
  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });
}

function extFromMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return null;
}

const TYPE_TO_COLUMN: Record<string, string> = {
  background: "background_url",
  boy: "boy_image_url",
  girl: "girl_image_url",
};

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const form = await req.formData();
    const file = form.get("file");
    const type = String(form.get("type") ?? ""); // background | boy | girl

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const column = TYPE_TO_COLUMN[type];
    if (!column) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const ext = extFromMime(file.type);
    if (!ext) {
      return NextResponse.json({ error: "Only PNG/JPG/WEBP allowed" }, { status: 400 });
    }

    const maxBytes = 4 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json({ error: "Max 4MB" }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    // nađi slug za ovog usera
    const { data: page, error: pageErr } = await supabase
      .from("guess_pages")
      .select("slug")
      .eq("owner_user_id", userId)
      .maybeSingle();

    if (pageErr) return NextResponse.json({ error: pageErr.message }, { status: 500 });
    if (!page?.slug) return NextResponse.json({ error: "Page not found" }, { status: 404 });

    const slug = page.slug as string;

    // ✅ NOVO: uvek nova putanja (cache-buster)
    const ts = Date.now();
    const path = `${slug}/${type}-${ts}.${ext}`;

    const buf = await file.arrayBuffer();

    const { error: upErr } = await supabase.storage
      .from("page-assets")
      .upload(path, buf, { contentType: file.type, upsert: false });

    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    const { data: pub } = supabase.storage.from("page-assets").getPublicUrl(path);
    const url = pub.publicUrl;

    const { error: updErr } = await supabase
      .from("guess_pages")
      .update({ [column]: url })
      .eq("slug", slug);

    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, type, url });
  } catch (e: any) {
    console.error("POST /api/dashboard/page/asset crashed:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { saveProfile } from "@/lib/profile";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const slug = String(body.slug || "").toLowerCase().trim();
  const message = String(body.message || "");
  const avatarUrl = String(body.avatarUrl || "");

  if (slug.length < 3) {
    return NextResponse.json({ error: "Slug mora imati bar 3 karaktera" }, { status: 400 });
  }

  const result = await saveProfile({ userId, slug, message, avatarUrl });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 409 });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}

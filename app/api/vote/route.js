import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, surname, vote } = await req.json();

    if (!name || !surname) {
      return NextResponse.json({ error: "Nedostaju podaci" }, { status: 400 });
    }

    if (!["optionA", "optionB"].includes(vote)) {
      return NextResponse.json({ error: "Nevažeća opcija" }, { status: 400 });
    }

    const key = `voter:${name.trim().toLowerCase()}_${surname.trim().toLowerCase()}`;
    const alreadyVoted = await kv.get(key);

    if (alreadyVoted) {
      return NextResponse.json({ error: "Već ste glasali!" }, { status: 400 });
    }

    await kv.set(key, true);
    await kv.incr(vote);

    const optionA = (await kv.get("optionA")) || 0;
    const optionB = (await kv.get("optionB")) || 0;

    return NextResponse.json({ success: true, results: { optionA, optionB } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Greška prilikom slanja glasa" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const optionA = (await kv.get("optionA")) || 0;
    const optionB = (await kv.get("optionB")) || 0;

    return NextResponse.json({ results: { optionA, optionB } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Greška prilikom čitanja glasova" }, { status: 500 });
  }
}

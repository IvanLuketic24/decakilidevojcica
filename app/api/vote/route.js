import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Uzmi trenutne rezultate glasanja
    const optionA = (await kv.get("optionA")) || 0;
    const optionB = (await kv.get("optionB")) || 0;

    return NextResponse.json({ results: { optionA, optionB } });
  } catch (err) {
    console.error("Error reading votes:", err);
    return NextResponse.json(
      { error: "Greška prilikom čitanja glasova" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { name, surname, vote } = await req.json();

    // Provera podataka
    if (!name || !surname) {
      return NextResponse.json(
        { error: "Nedostaju podaci" },
        { status: 400 }
      );
    }

    if (!["optionA", "optionB"].includes(vote)) {
      return NextResponse.json(
        { error: "Nevažeća opcija" },
        { status: 400 }
      );
    }

    // Napravi jedinstveni key za korisnika (case-insensitive)
    const key = `voter:${name.trim().toLowerCase()}_${surname
      .trim()
      .toLowerCase()}`;

    // Provera da li je korisnik već glasao
    const alreadyVoted = await kv.get(key);
    if (alreadyVoted) {
      return NextResponse.json(
        { error: "Već ste glasali!" },
        { status: 400 }
      );
    }

    // Zabeleži da je korisnik glasao
    await kv.set(key, true);

    // Povećaj glas za izabranu opciju
    await kv.incr(vote);

    // Uzmi ažurirane rezultate
    const optionA = (await kv.get("optionA")) || 0;
    const optionB = (await kv.get("optionB")) || 0;

    return NextResponse.json({
      success: true,
      results: { optionA, optionB },
    });
  } catch (err) {
    console.error("Error sending vote:", err);
    return NextResponse.json(
      { error: "Greška prilikom slanja glasa" },
      { status: 500 }
    );
  }
}

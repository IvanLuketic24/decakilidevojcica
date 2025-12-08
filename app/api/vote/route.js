import { NextResponse } from "next/server";

// Memorija u kojoj će glasovi biti pohranjeni
let votes = [];

export async function POST(req) {
  const { name, surname, vote } = await req.json();
  if (!name || !surname || !vote) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  votes.push({
    name,
    surname,
    vote,
    timestamp: Date.now(),
  });

  return NextResponse.json({ success: true });
}

export async function GET() {
  const optionA = votes.filter(v => v.vote === "optionA").length;
  const optionB = votes.filter(v => v.vote === "optionB").length;

  return NextResponse.json({
    results: { optionA, optionB },
    allVotes: votes
  });
}

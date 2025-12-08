import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "votes.json");

// Ucitavanje glasova
async function loadVotes() {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

// Cuvanje glasova
async function saveVotes(votes) {
  await fs.writeFile(filePath, JSON.stringify(votes, null, 2));
}

// POST → glasanje
export async function POST(req) {
  const { name, surname, vote } = await req.json();

  if (!name || !surname || !vote) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const votes = await loadVotes();

  votes.push({
    name,
    surname,
    vote,
    timestamp: Date.now(),
  });

  await saveVotes(votes);

  return NextResponse.json({ success: true });
}

// GET → rezultati + lista glasova
export async function GET() {
  const votes = await loadVotes();

  const optionA = votes.filter(v => v.vote === "optionA").length;
  const optionB = votes.filter(v => v.vote === "optionB").length;

  return NextResponse.json({
    results: { optionA, optionB },
    allVotes: votes
  });
}

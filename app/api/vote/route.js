import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// lokacija fajla gde cuvamo glasove
const filePath = path.join(process.cwd(), "data", "votes.json");

// Helper: ucitaj listu glasova ili napravi praznu
function loadVotes() {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const raw = fs.readFileSync(filePath);
  return JSON.parse(raw);
}

// Helper: sacuvaj glasove u fajl
function saveVotes(votes) {
  fs.writeFileSync(filePath, JSON.stringify(votes, null, 2));
}

//
// POST → korisnik glasa
//
export async function POST(req) {
  const body = await req.json();
  const { name, surname, vote } = body;

  if (!name || !surname || !vote) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const votes = loadVotes();

  // Sacuvaj glas
  votes.push({
    name,
    surname,
    vote,            // optionA ili optionB
    timestamp: Date.now()
  });

  saveVotes(votes);

  return NextResponse.json({ success: true });
}

//
// GET → admin dobija listu glasova i statistiku
//
export async function GET() {
  const votes = loadVotes();

  // brojenje glasova
  const optionA = votes.filter(v => v.vote === "optionA").length;
  const optionB = votes.filter(v => v.vote === "optionB").length;

  return NextResponse.json({
    results: {
      optionA,
      optionB
    },
    allVotes: votes // cela lista za admin stranicu
  });
}

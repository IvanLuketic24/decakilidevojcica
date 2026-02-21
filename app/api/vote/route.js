import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const VOTES_LIST_KEY = "votes:list";
const COUNT_A_KEY = "votes:count:optionA";
const COUNT_B_KEY = "votes:count:optionB";

function getCookie(req, name) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const { name, surname, vote } = body || {};

  if (!name || !surname || !vote) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (vote !== "optionA" && vote !== "optionB") {
    return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
  }

  let voterId = getCookie(req, "voter_id");
  if (!voterId) voterId = makeId();

  const already = await kv.get(`votes:by:${voterId}`);
  if (already) {
    return NextResponse.json({ error: "Već ste glasali." }, { status: 409 });
  }

  const entry = { name, surname, vote, timestamp: Date.now() };

  await kv.set(`votes:by:${voterId}`, "1");
  await kv.lpush(VOTES_LIST_KEY, JSON.stringify(entry));
  await kv.incr(vote === "optionA" ? COUNT_A_KEY : COUNT_B_KEY);

  const res = NextResponse.json({ success: true });
  res.headers.append(
    "Set-Cookie",
    `voter_id=${encodeURIComponent(voterId)}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`
  );

  return res;
}

export async function GET() {
  const [a, b, raw] = await Promise.all([
    kv.get(COUNT_A_KEY),
    kv.get(COUNT_B_KEY),
    kv.lrange(VOTES_LIST_KEY, 0, 499),
  ]);

  const allVotes = (raw || [])
    .map((x) => {
      try {
        return JSON.parse(x);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return NextResponse.json({
    results: {
      optionA: Number(a || 0),
      optionB: Number(b || 0),
    },
    allVotes,
  });
}

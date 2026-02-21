import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase.from("votes").select("*");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const optionA = data.filter(v => v.vote === "optionA").length;
  const optionB = data.filter(v => v.vote === "optionB").length;

  return Response.json({
    results: { optionA, optionB },
    voters: data
  });
}

export async function POST(req) {
  const { name, surname, vote } = await req.json();

  const { error } = await supabase
    .from("votes")
    .insert([{ name, surname, vote }]);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}

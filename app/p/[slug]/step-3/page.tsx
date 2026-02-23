"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Counts = { boy: number; girl: number; total: number };

export default function Step3Page() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = useMemo(() => (params?.slug ? String(params.slug) : ""), [params]);

  const [counts, setCounts] = useState<Counts>({ boy: 0, girl: 0, total: 0 });
  const [actualGender, setActualGender] = useState<"boy" | "girl" | null>(null);
  const [loading, setLoading] = useState(true);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data: page } = await supabase
        .from("guess_pages")
        .select("actual_gender")
        .eq("slug", slug)
        .maybeSingle();

      if (page?.actual_gender) setActualGender(page.actual_gender);

      const { data: votes } = await supabase.from("guess_votes").select("choice").eq("slug", slug);

      const boy = (votes ?? []).filter((v) => v.choice === "boy").length;
      const girl = (votes ?? []).filter((v) => v.choice === "girl").length;
      const total = (votes ?? []).length;

      setCounts({ boy, girl, total });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!slug) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const ch = supabase
      .channel(`step3_votes_${slug}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guess_votes", filter: `slug=eq.${slug}` },
        () => load()
      )
      .subscribe();

    channelRef.current = ch;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const lastChoice = useMemo(() => {
    try {
      return (localStorage.getItem(`last_choice:${slug}`) as "boy" | "girl" | null) ?? null;
    } catch {
      return null;
    }
  }, [slug]);

  const labelChoiceLower = (c: "boy" | "girl") => (c === "boy" ? "dečak" : "devojčica");

  const isCorrect = lastChoice && actualGender ? lastChoice === actualGender : null;

  const babyLine =
    actualGender && isCorrect !== null
      ? `${isCorrect ? "Daa" : "Nee"}, ja sam ${labelChoiceLower(actualGender)} ❤️`
      : null;

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center px-4"
      style={{
        backgroundImage: `url(/step1-bg.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-black/40 backdrop-blur p-6 text-white shadow-lg">
        {babyLine && (
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight">{babyLine}</h1>
          </div>
        )}

        <div className={`${babyLine ? "mt-5" : ""} rounded-xl border border-white/10 bg-black/20 p-4`}>
          <div className="text-sm font-semibold mb-2">Trenutno stanje</div>
          <div className="text-sm text-white/80 flex justify-between">
            <span>Dečak</span> <b>{counts.boy}</b>
          </div>
          <div className="text-sm text-white/80 flex justify-between mt-1">
            <span>Devojčica</span> <b>{counts.girl}</b>
          </div>
          <div className="text-sm text-white/80 flex justify-between mt-1">
            <span>Ukupno</span> <b>{counts.total}</b>
          </div>

          {loading && <div className="mt-3 text-sm text-white/70">Osvežavam…</div>}
        </div>
      </div>
    </main>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type NameLS = { first_name?: string; last_name?: string; firstName?: string; lastName?: string };

type Assets = {
  background_url?: string | null;
  boy_image_url?: string | null;
  girl_image_url?: string | null;
};

export default function Step2Page() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = useMemo(() => (params?.slug ? String(params.slug) : ""), [params]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<Assets>({});
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [v, setV] = useState<number>(() => Date.now());

  const voterKey = useMemo(() => {
    const fn = firstName.trim().toLowerCase();
    const ln = lastName.trim().toLowerCase();
    return `choice:${slug}:${fn}:${ln}`;
  }, [slug, firstName, lastName]);

  useEffect(() => {
    if (!slug) return;

    // ime iz step-1
    try {
      const raw = localStorage.getItem(`guess:${slug}`);
      if (raw) {
        const p: NameLS = JSON.parse(raw);
        setFirstName((p.first_name ?? p.firstName ?? "").trim());
        setLastName((p.last_name ?? p.lastName ?? "").trim());
      }
    } catch {}

    // assets
    setAssetsLoaded(false);
    (async () => {
      const res = await fetch(`/api/public/page?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setAssets({
          background_url: data.background_url ?? null,
          boy_image_url: data.boy_image_url ?? null,
          girl_image_url: data.girl_image_url ?? null,
        });
        setV(Date.now()); // cache-buster
      }
      setAssetsLoaded(true);
    })();
  }, [slug]);

  const vote = async (choice: "boy" | "girl") => {
    const fn = firstName.trim();
    const ln = lastName.trim();

    if (!fn || !ln) {
      router.push(`/p/${slug}/step-1`);
      return;
    }

    if (localStorage.getItem(voterKey)) {
      router.push(`/p/${slug}/step-3`);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("guess_votes").insert({
        slug,
        choice,
        first_name: fn,
        last_name: ln,
      });

      if (error) {
        alert(error.message);
        return;
      }

      localStorage.setItem(voterKey, choice);
      localStorage.setItem(`last_choice:${slug}`, choice);

      router.push(`/p/${slug}/step-3`);
    } finally {
      setLoading(false);
    }
  };

  if (!assetsLoaded) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center px-4 bg-[#0b0f19] text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-sm">
          <div className="text-sm text-white/70">Učitavam…</div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="h-56 rounded-2xl bg-white/5 border border-white/10" />
            <div className="h-56 rounded-2xl bg-white/5 border border-white/10" />
          </div>
        </div>
      </main>
    );
  }

  const bg = assets.background_url || "/step1-bg.png";
  const boy = assets.boy_image_url || "/decak.png";
  const girl = assets.girl_image_url || "/devojcica.png";

  const boySrc = `${boy}${boy.includes("?") ? "&" : "?"}v=${v}`;
  const girlSrc = `${girl}${girl.includes("?") ? "&" : "?"}v=${v}`;

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center px-4"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-black/40 backdrop-blur p-6 text-white shadow-lg">
        <div className="text-center">
         <h1 className="text-2xl font-extrabold tracking-tight mt-1">
  Šta misliš, šta sam? 👶
</h1>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            disabled={loading}
            onClick={() => vote("boy")}
            className="rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 transition p-4 flex flex-col items-center"
          >
            <img src={boySrc} alt="Dečak" className="w-48 h-48 object-contain" />
            <span className="mt-3 text-base font-bold">Dečak</span>
          </button>

          <button
            disabled={loading}
            onClick={() => vote("girl")}
            className="rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 transition p-4 flex flex-col items-center"
          >
            <img src={girlSrc} alt="Devojčica" className="w-48 h-48 object-contain" />
            <span className="mt-3 text-base font-bold">Devojčica</span>
          </button>
        </div>

        {loading && <div className="mt-4 text-center text-sm text-white/70">Upisujem glas…</div>}

        <button
          onClick={() => router.push(`/p/${slug}/step-1`)}
          className="mt-5 w-full rounded-xl border border-white/20 py-2 text-sm font-semibold hover:border-white/40"
        >
          Nazad
        </button>
      </div>
    </main>
  );
}
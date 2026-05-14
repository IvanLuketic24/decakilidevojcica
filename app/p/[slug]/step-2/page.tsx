"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type NameLS = {
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
};

type Assets = {
  background_url?: string | null;
  boy_image_url?: string | null;
  girl_image_url?: string | null;
};

type OwnerInfo = {
  owner_first_name: string | null;
  owner_last_name: string | null;
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

  const voterKey = useMemo(() => {
    const fn = firstName.trim().toLowerCase();
    const ln = lastName.trim().toLowerCase();
    return `choice:${slug}:${fn}:${ln}`;
  }, [slug, firstName, lastName]);

  useEffect(() => {
    if (!slug) return;

    try {
      const raw = localStorage.getItem(`guess:${slug}`);
      if (raw) {
        const p: NameLS = JSON.parse(raw);
        setFirstName((p.first_name ?? p.firstName ?? "").trim());
        setLastName((p.last_name ?? p.lastName ?? "").trim());
      }
    } catch {}

    setAssetsLoaded(false);

    (async () => {
      const res = await fetch(`/api/public/page?slug=${encodeURIComponent(slug)}`, {
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setAssets({
          background_url: data.background_url ?? null,
          boy_image_url: data.boy_image_url ?? null,
          girl_image_url: data.girl_image_url ?? null,
        });
      }

      setAssetsLoaded(true);
    })();
  }, [slug]);

  const fetchOwnerInfo = async (): Promise<OwnerInfo> => {
    const { data } = await supabase
      .from("guess_pages")
      .select("owner_first_name, owner_last_name")
      .eq("slug", slug)
      .maybeSingle();

    return {
      owner_first_name: (data as any)?.owner_first_name ?? null,
      owner_last_name: (data as any)?.owner_last_name ?? null,
    };
  };

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
      const owner = await fetchOwnerInfo();

      const { error } = await supabase.from("guess_votes").insert({
        slug,
        choice,
        first_name: fn,
        last_name: ln,
        owner_first_name: owner.owner_first_name,
        owner_last_name: owner.owner_last_name,
      });

      if (error) {
        const { error: error2 } = await supabase.from("guess_votes").insert({
          slug,
          choice,
          first_name: fn,
          last_name: ln,
        });

        if (error2) {
          alert(error2.message);
          return;
        }
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
      <main className="min-h-screen flex items-center justify-center bg-[#0b0f19] text-white">
        Učitavam...
      </main>
    );
  }

  const bg = assets.background_url || "/step1-bg.png";

  const boy = assets.boy_image_url || "/decak-v2.png";
  const girl = assets.girl_image_url || "/devojcica-v2.png";

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md bg-black/40 text-white p-6 rounded-2xl">
        <h1 className="text-2xl font-bold text-center">
          Šta misliš, šta sam? 👶
        </h1>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            disabled={loading}
            onClick={() => vote("boy")}
            className="p-4 rounded-xl bg-white/10"
          >
            <img src={boy} alt="boy" className="w-full h-40 object-contain" />
            <div className="text-center mt-2 font-bold">Dečak</div>
          </button>

          <button
            disabled={loading}
            onClick={() => vote("girl")}
            className="p-4 rounded-xl bg-white/10"
          >
            <img src={girl} alt="girl" className="w-full h-40 object-contain" />
            <div className="text-center mt-2 font-bold">Devojčica</div>
          </button>
        </div>

        {loading && (
          <p className="text-center mt-4 text-sm opacity-70">
            Upisujem glas...
          </p>
        )}
      </div>
    </main>
  );
}
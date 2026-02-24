"use client";

import { useEffect, useRef, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

type Counts = { boy: number; girl: number; total: number };

type Voter = {
  first_name?: string | null;
  last_name?: string | null;
  choice: "boy" | "girl";
  created_at?: string | null;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const [actualGender, setActualGender] = useState<"boy" | "girl">("girl");
  const [loading, setLoading] = useState(false);

  const [link, setLink] = useState<string>("");
  const [counts, setCounts] = useState<Counts>({ boy: 0, girl: 0, total: 0 });
  const [voters, setVoters] = useState<Voter[]>([]);
  const [slug, setSlug] = useState<string>("");

  // asseti
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [boyUrl, setBoyUrl] = useState("");
  const [girlUrl, setGirlUrl] = useState("");
  const [assetUploading, setAssetUploading] = useState<"background" | "boy" | "girl" | null>(null);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // refs za hidden file inpute (da ne prikazuje "no file chosen")
  const bgInputRef = useRef<HTMLInputElement | null>(null);
  const boyInputRef = useRef<HTMLInputElement | null>(null);
  const girlInputRef = useRef<HTMLInputElement | null>(null);

  const loadMyPage = async () => {
    const res = await fetch("/api/dashboard/page", { credentials: "include" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data?.error || "Greška");
      return;
    }

    setSlug(data.slug);
    setActualGender(data.actual_gender);
    setCounts(data.counts);
    setLink(`${window.location.origin}/p/${data.slug}/step-1`);
    setVoters(Array.isArray(data.voters) ? data.voters : []);

    setBackgroundUrl(data.background_url || "");
    setBoyUrl(data.boy_image_url || "");
    setGirlUrl(data.girl_image_url || "");
  };

  useEffect(() => {
    loadMyPage();
  }, []);

  // realtime osvežavanje kad stigne glas
  useEffect(() => {
    if (!slug) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const ch = supabase
      .channel(`dashboard_votes_${slug}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guess_votes", filter: `slug=eq.${slug}` },
        () => loadMyPage()
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

  const saveGender = async () => {
    setLoading(true);

    const res = await fetch("/api/dashboard/page/gender", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ actual_gender: actualGender }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      alert(data?.error || "Greška");
      return;
    }

    alert("Sačuvano ✅");
    await loadMyPage();
  };

  const copyLink = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    alert("Link kopiran ✅");
  };

  // ✅ NOVO: reset glasova
  const resetVotes = async () => {
    const ok = confirm("Sigurno želiš da resetuješ sve glasove? Ovo se ne može vratiti.");
    if (!ok) return;

    const res = await fetch("/api/dashboard/page/reset", {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data?.error || "Greška pri resetovanju.");
      return;
    }

    alert("Glasovi su resetovani ✅");
    await loadMyPage();
  };

  const uploadAsset = async (type: "background" | "boy" | "girl", file: File) => {
    setAssetUploading(type);
    try {
      const fd = new FormData();
      fd.append("type", type);
      fd.append("file", file);

      const res = await fetch("/api/dashboard/page/asset", {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.error || "Greška upload-a");
        return;
      }

      if (type === "background") setBackgroundUrl(data.url);
      if (type === "boy") setBoyUrl(data.url);
      if (type === "girl") setGirlUrl(data.url);

      alert("Sačuvano ✅");
    } finally {
      setAssetUploading(null);
    }
  };

  const labelChoice = (c: "boy" | "girl") => (c === "boy" ? "Dečak" : "Devojčica");

  const formatName = (v: Voter) => {
    const name = `${(v.first_name ?? "").trim()} ${(v.last_name ?? "").trim()}`.trim();
    return name || "Nepoznato ime";
  };

  return (
    <main className="min-h-screen bg-[#0b0f19] text-white">
      <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
        <div>
          <div className="text-sm text-white/70">Dashboard</div>

          <h1 className="text-2xl font-extrabold tracking-tight">
            <span className="text-sky-400">Dečak</span>{" "}
            <span className="text-white/90">ili</span>{" "}
            <span className="text-pink-400">Devojčica</span>
            <span className="text-white/70">. fun</span>
          </h1>

          <div className="text-sm text-white/70 mt-1">Rezultati se osvežavaju automatski.</div>
        </div>
        <UserButton afterSignOutUrl="/sign-in" />
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-10 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Podešavanje</h2>

          <div className="mt-5">
            <div className="text-sm font-medium mb-2">Pol bebe</div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActualGender("boy")}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  actualGender === "boy"
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white border-white/20 hover:border-white/40"
                }`}
              >
                Dečak
              </button>

              <button
                type="button"
                onClick={() => setActualGender("girl")}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  actualGender === "girl"
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white border-white/20 hover:border-white/40"
                }`}
              >
                Devojčica
              </button>
            </div>

            <button
              onClick={saveGender}
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-white text-black py-3 text-sm font-bold hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Čuvam..." : "Sačuvaj"}
            </button>
          </div>

          {/* Upload sekcija */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3">Slike</h3>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-medium mb-2">Background</div>

              <div className="mb-3 rounded-xl overflow-hidden border border-white/10">
                <img
                  src={backgroundUrl || "/step1-bg.png"}
                  className="w-full h-28 object-cover"
                  alt="bg"
                />
              </div>

              <input
                ref={bgInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={assetUploading === "background"}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadAsset("background", f);
                  e.currentTarget.value = "";
                }}
                className="hidden"
              />
              <button
                type="button"
                disabled={assetUploading === "background"}
                onClick={() => bgInputRef.current?.click()}
                className="inline-flex items-center justify-center rounded-xl bg-white text-black px-4 py-2 text-sm font-bold hover:opacity-90 disabled:opacity-60"
              >
                Choose File
              </button>

              {assetUploading === "background" && (
                <div className="mt-2 text-sm text-white/70">Uploadujem…</div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm font-medium mb-2">Dečak slika</div>

                <div className="mb-3 rounded-xl overflow-hidden border border-white/10 bg-black/30 flex items-center justify-center h-28">
                  <img src={boyUrl || "/decak.png"} className="h-24 object-contain" alt="boy" />
                </div>

                <input
                  ref={boyInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={assetUploading === "boy"}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadAsset("boy", f);
                    e.currentTarget.value = "";
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={assetUploading === "boy"}
                  onClick={() => boyInputRef.current?.click()}
                  className="inline-flex items-center justify-center rounded-xl bg-white text-black px-4 py-2 text-sm font-bold hover:opacity-90 disabled:opacity-60"
                >
                  Choose File
                </button>

                {assetUploading === "boy" && (
                  <div className="mt-2 text-sm text-white/70">Uploadujem…</div>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm font-medium mb-2">Devojčica slika</div>

                <div className="mb-3 rounded-xl overflow-hidden border border-white/10 bg-black/30 flex items-center justify-center h-28">
                  <img
                    src={girlUrl || "/devojcica.png"}
                    className="h-24 object-contain"
                    alt="girl"
                  />
                </div>

                <input
                  ref={girlInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  disabled={assetUploading === "girl"}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadAsset("girl", f);
                    e.currentTarget.value = "";
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={assetUploading === "girl"}
                  onClick={() => girlInputRef.current?.click()}
                  className="inline-flex items-center justify-center rounded-xl bg-white text-black px-4 py-2 text-sm font-bold hover:opacity-90 disabled:opacity-60"
                >
                  Choose File
                </button>

                {assetUploading === "girl" && (
                  <div className="mt-2 text-sm text-white/70">Uploadujem…</div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Link i glasovi</h2>
          <p className="mt-1 text-sm text-white/70">Pošalji link i prati rezultate.</p>

          <div className="mt-5">
            <input
              readOnly
              value={link || "Učitavam link..."}
              className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none"
              onFocus={(e) => e.currentTarget.select()}
            />

            <div className="mt-3 flex gap-3">
              <button
                onClick={copyLink}
                disabled={!link}
                className="flex-1 rounded-xl border border-white/20 py-3 text-sm font-semibold hover:border-white/40 disabled:opacity-50"
              >
                Kopiraj
              </button>

              <a
                href={link || "#"}
                target="_blank"
                rel="noreferrer"
                className={`flex-1 text-center rounded-xl bg-white text-black py-3 text-sm font-bold ${
                  link ? "hover:opacity-90" : "opacity-50 pointer-events-none"
                }`}
              >
                Otvori
              </a>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-semibold mb-2">Rezultat glasanja</div>
              <div className="text-sm text-white/80 flex justify-between">
                <span>Dečak</span> <b>{counts.boy}</b>
              </div>
              <div className="text-sm text-white/80 flex justify-between mt-1">
                <span>Devojčica</span> <b>{counts.girl}</b>
              </div>
              <div className="text-sm text-white/80 flex justify-between mt-1">
                <span>Ukupno</span> <b>{counts.total}</b>
              </div>
            </div>

            {/* ADMIN lista sa scrollom */}
            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-semibold mb-2">Ko je glasao (admin)</div>

              {voters.length === 0 ? (
                <div className="text-sm text-white/70">Još nema glasova.</div>
              ) : (
                <div className="max-h-80 overflow-y-auto pr-1 divide-y divide-white/10">
                  {voters.map((v, i) => (
                    <div key={i} className="py-2 flex items-center justify-between">
                      <div className="text-sm text-white/90">{formatName(v)}</div>
                      <div className="text-sm font-semibold">{labelChoice(v.choice)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ✅ NOVO: dugme ispod liste sa glasovima */}
            <button
              onClick={resetVotes}
              className="mt-3 w-full rounded-xl border border-red-400/40 bg-red-500/10 py-3 text-sm font-extrabold text-red-200 hover:border-red-300/70 hover:bg-red-500/15"
            >
              Resetuj glasove
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
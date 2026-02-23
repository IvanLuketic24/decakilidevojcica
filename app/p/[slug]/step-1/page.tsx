"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function Step1Page() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = useMemo(() => (params?.slug ? String(params.slug) : ""), [params]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const next = () => {
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (!fn || !ln) {
      alert("Unesi ime i prezime 🙂");
      return;
    }

    localStorage.setItem(`guess:${slug}`, JSON.stringify({ first_name: fn, last_name: ln }));
    router.push(`/p/${slug}/step-2`);
  };

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
        <div className="text-center">
          <p className="mt-2 text-sm text-white/80">Unesi svoje ime i prezime</p>
        </div>

        <div className="mt-6 grid gap-3">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Ime"
            className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none"
          />
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Prezime"
            className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none"
          />

          <button
            onClick={next}
            className="mt-2 w-full rounded-xl bg-white text-black py-3 text-sm font-bold hover:opacity-90"
          >
            Nastavi
          </button>
        </div>
      </div>
    </main>
  );
}
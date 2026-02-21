"use client";

import { useState } from "react";

export default function DashboardPage() {
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [status, setStatus] = useState("");

  async function handleSave() {
    setStatus("Čuvam...");

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, message, avatarUrl }),
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(data.error || "Greška");
      return;
    }

    setStatus("Sačuvano ✅");
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }}>
      <h1>Dashboard</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          placeholder="Slug (npr. marko)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />

        <textarea
          placeholder="Tvoja poruka"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <input
          placeholder="Avatar URL"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
        />

        <button onClick={handleSave}>Sačuvaj</button>

        {status && <p>{status}</p>}
      </div>
    </div>
  );
}

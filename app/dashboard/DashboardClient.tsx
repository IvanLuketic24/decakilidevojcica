"use client";

import { useState } from "react";

export default function Dashboard() {
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [status, setStatus] = useState("");

  async function handleSave() {
    setStatus("Čuvam...");

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          message,
          avatarUrl,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus(data.error || "Greška");
        return;
      }

      setStatus("Sačuvano ✅");
    } catch (err) {
      setStatus("Greška u konekciji");
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Dashboard</h1>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Slug</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="npr. ivan"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
          <small style={{ opacity: 0.7 }}>
            Link: {slug ? `/u/${slug.toLowerCase().trim()}` : "—"}
          </small>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Poruka</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tvoja poruka..."
            rows={4}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Avatar URL</span>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
        </label>

        {avatarUrl && (
          <img
            src={avatarUrl}
            alt="preview"
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        )}

        <button
          type="button"
          onClick={handleSave}
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid #ccc",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Sačuvaj
        </button>

        {status && <p>{status}</p>}
      </div>
    </div>
  );
}

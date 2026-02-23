"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";

export default function DashboardClient() {
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [status, setStatus] = useState("");

  // Load existing profile
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) return;

      const data = await res.json();
      if (data?.profile) {
        setSlug(data.profile.slug || "");
        setMessage(data.profile.message || "");
        setAvatarUrl(data.profile.avatarUrl || "");
      }
    })();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Čuvam...");

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, message, avatarUrl }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      setStatus("Sačuvano ✅");
    } else {
      setStatus(data?.error || "Greška ❌");
    }
  }

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "40px auto",
        padding: 24,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>
          Tvoj Dashboard
        </h1>

        <UserButton afterSignOutUrl="/sign-in" />
      </div>

      <form
        onSubmit={handleSave}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div>
          <label>Slug (URL ime)</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="npr. ivan"
            style={inputStyle}
          />
        </div>

        <div>
          <label>Poruka</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Upiši poruku..."
            style={{ ...inputStyle, minHeight: 100 }}
          />
        </div>

        <div>
          <label>Avatar URL</label>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            border: "none",
            background: "#6366f1",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Sačuvaj
        </button>

        {status && (
          <div style={{ marginTop: 10 }}>
            {status}
          </div>
        )}
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 6,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
};
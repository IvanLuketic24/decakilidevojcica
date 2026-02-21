"use client";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [voters, setVoters] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/vote");
      const data = await res.json();
      setVoters(data.voters || []);
    }
    load();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Stimmen – Übersicht</h1>

      {voters.length === 0 && <p>Keine Daten…</p>}

      {voters.map((v, i) => (
        <div key={i} style={{ marginBottom: "1rem" }}>
          <strong>{v.name} {v.surname}</strong> – {v.vote}
        </div>
      ))}
    </div>
  );
}

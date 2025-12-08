"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [votes, setVotes] = useState([]);

  useEffect(() => {
    const fetchVotes = async () => {
      const res = await fetch("/api/vote");
      const data = await res.json();
      setVotes(data.allVotes || []);
    };
    fetchVotes();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Admin - Lista Glasova</h1>

      <table border="1" cellPadding="8" style={{ marginTop: "1rem", width: "100%", background: "#fff" }}>
        <thead>
          <tr>
            <th>Ime</th>
            <th>Prezime</th>
            <th>Glas</th>
          </tr>
        </thead>

        <tbody>
          {votes.length === 0 && (
            <tr>
              <td colSpan={3} style={{ textAlign: "center" }}>Nema glasova.</td>
            </tr>
          )}

          {votes.map((v, i) => (
            <tr key={i}>
              <td>{v.name}</td>
              <td>{v.surname}</td>
              <td>{v.vote === "optionA" ? "Dečak" : "Devojčica"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

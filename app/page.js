"use client";

import { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Home() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [vote, setVote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState({ optionA: 0, optionB: 0 });
  const [canShowResults, setCanShowResults] = useState(false);

  const releaseTime = new Date("2025-11-26T20:00:00"); // promeni datum po želji

  const handleVote = async (option) => {
    if (!name || !surname) { alert("Unesi ime i prezime!"); return; }
    setVote(option);
    setSubmitted(true);

    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, surname, vote: option }),
    });

    const data = await res.json();
    if (data.error) {
      alert(data.error);
    } else {
      setResults(data.results);
    }
  };

  useEffect(() => {
    const now = new Date();
    setCanShowResults(now >= releaseTime);

    const fetchResults = async () => {
      const res = await fetch("/api/vote");
      const data = await res.json();
      setResults(data.results);
    };

    fetchResults();
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, []);

  const data = {
    labels: ["Opcija A", "Opcija B"],
    datasets: [
      { label: "Glasovi", data: [results.optionA, results.optionB], backgroundColor: ["#36A2EB", "#FF6384"] }
    ]
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      {!submitted ? (
        <>
          <h1>Decak ili Devojcica?</h1>
          <input placeholder="Ime" value={name} onChange={(e) => setName(e.target.value)} style={{ marginRight: "1rem" }} />
          <input placeholder="Prezime" value={surname} onChange={(e) => setSurname(e.target.value)} />
          <div style={{ marginTop: "2rem" }}>
            <img src="/optionA.jpg" alt="Opcija A" width={150} style={{ cursor: "pointer", marginRight: "2rem" }} onClick={() => handleVote("optionA")} />
            <img src="/optionB.jpg" alt="Opcija B" width={150} style={{ cursor: "pointer" }} onClick={() => handleVote("optionB")} />
          </div>
        </>
      ) : (
        <>
          <h2>Hvala na glasu, {name} {surname}!</h2>
          {canShowResults ? <Pie data={data} /> : <p>Rezultati će biti objavljeni u sredu u 20h.</p>}
        </>
      )}
    </div>
  );
}

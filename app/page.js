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
  const [step, setStep] = useState(1);
  const [results, setResults] = useState({ optionA: 0, optionB: 0 });
  const [canShowResults, setCanShowResults] = useState(false);

  const releaseTime = new Date("2025-11-26T20:00:00");

  const handleNext = () => {
    if (!name || !surname) {
      alert("Unesi ime i prezime!");
      return;
    }
    setStep(2);
  };

  const handleVote = async (option) => {
    if (!name || !surname) {
      alert("Unesi ime i prezime!");
      return;
    }
    setVote(option);
    setSubmitted(true);

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, surname, vote: option }),
      });
      const data = await res.json();
      if (data.error) alert(data.error);
    } catch (err) {
      console.error("Greška prilikom slanja glasa:", err);
    }
  };

  useEffect(() => {
    const now = new Date();
    setCanShowResults(now >= releaseTime);

    const fetchResults = async () => {
      try {
        const res = await fetch("/api/vote");
        const data = await res.json();
        setResults(data.results);
      } catch (err) {
        console.error("Greška prilikom čitanja glasova:", err);
      }
    };

    fetchResults();
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, []);

  const data = {
    labels: ["Dečak", "Devojčica"],
    datasets: [
      {
        label: "Glasovi",
        data: [results.optionA, results.optionB],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  const getThankYouMessage = () => {
    if (vote === "optionA") 
      return "Znam da bi možda voleo/a da sam Dečak ali ja sam DEVOJČICA ❤️";
    if (vote === "optionB") 
      return "Jeste, ja sam DEVOJČICA ❤️";
    return `Hvala na glasu, ${name} ${surname}!`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: 'url("/background.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "Arial, sans-serif",
        color: "#000", // CRNI TEKST
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "2rem",
        flexDirection: "column",
      }}
    >
      {/* PRVA STRANA - unos imena i prezimena */}
      {!submitted && step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: "400px" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem", color: "#000" }}>Unesite ime i prezime</h1>
          <input
            placeholder="Ime"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ fontSize: "1.1rem", marginBottom: "1rem", padding: "0.6rem", textAlign: "center", width: "100%", borderRadius: "8px", border: "1px solid #ccc" }}
          />
          <input
            placeholder="Prezime"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            style={{ fontSize: "1.1rem", marginBottom: "1.5rem", padding: "0.6rem", textAlign: "center", width: "100%", borderRadius: "8px", border: "1px solid #ccc" }}
          />
          <button
            onClick={handleNext}
            style={{ fontSize: "1.2rem", padding: "0.6rem 2rem", cursor: "pointer", borderRadius: "10px", border: "none", backgroundColor: "#36A2EB", color: "#000", fontWeight: "bold" }}
          >
            Dalje
          </button>
        </div>
      )}

      {/* DRUGA STRANA - izbor slike */}
      {!submitted && step === 2 && (
        <div style={{ width: "100%", maxWidth: "600px" }}>
          <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem", color: "#000" }}>Šta misliš šta je? (klikni na sliku)</h2>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            {/* Leva - Dečak */}
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: "0.5rem", color: "#000" }}>Dečak</h3>
              <img
                src="/optionA.jpg"
                style={{ width: "100%", maxWidth: "220px", borderRadius: "12px", cursor: "pointer" }}
                onClick={() => handleVote("optionA")}
              />
            </div>
            {/* Desna - Devojčica */}
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: "0.5rem", color: "#000" }}>Devojčica</h3>
              <img
                src="/devojcica.jpg"
                style={{ width: "100%", maxWidth: "220px", borderRadius: "12px", cursor: "pointer" }}
                onClick={() => handleVote("optionB")}
              />
            </div>
          </div>
        </div>
      )}

      {/* HVALA + REZULTATI */}
      {submitted && (
        <div style={{ marginTop: "2rem", padding: "1rem" }}>
          <h2 style={{ fontSize: "1.4rem", marginBottom: "1rem", color: "#000" }}>{getThankYouMessage()}</h2>
          {canShowResults ? (
            <div style={{ maxWidth: "400px", margin: "0 auto" }}>
              <Pie data={data} />
            </div>
          ) : (
            <p style={{ fontSize: "1rem", color: "#000" }}>Rezultati će biti objavljeni u sredu u 20h.</p>
          )}
        </div>
      )}
    </div>
  );
}

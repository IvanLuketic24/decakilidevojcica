"use client";

import { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Home() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [step, setStep] = useState(1); // korak 1 = unos, korak 2 = slike
  const [vote, setVote] = useState("");
  const [submitted, setSubmitted] = useState(false);
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
    setVote(option);
    setSubmitted(true);

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, surname, vote: option }),
      });
      const data = await res.json();
      if (data.results) setResults(data.results);
    } catch (err) {
      console.error("Greška pri slanju glasa:", err);
    }
  };

  useEffect(() => {
    const now = new Date();
    setCanShowResults(now >= releaseTime);

    const fetchResults = async () => {
      try {
        const res = await fetch("/api/vote");
        const data = await res.json();
        if (data.results) setResults(data.results);
      } catch (err) {
        console.error("Greška pri čitanju glasova:", err);
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
    if (vote === "optionA") {
      return "Znam da bi voleo/a da sam Dečak ali ja sam DEVOJCICA ❤️";
    }
    if (vote === "optionB") {
      return "Jeste ja sam DEVOJCICA ❤️";
    }
    return `Hvala na glasu, ${name} ${surname}!`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: 'url("/background.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "Cursive, serif",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      {step === 1 && !submitted && (
        <div
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: "3rem",
            borderRadius: "1rem",
            display: "inline-block",
          }}
        >
          <h1 style={{ fontSize: "3rem", marginBottom: "2rem" }}>Unesite ime i prezime</h1>
          <input
            placeholder="Ime"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ fontSize: "1.5rem", marginRight: "1rem", padding: "0.5rem", textAlign: "center" }}
          />
          <input
            placeholder="Prezime"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            style={{ fontSize: "1.5rem", padding: "0.5rem", textAlign: "center" }}
          />
          <div style={{ marginTop: "2rem" }}>
            <button
              onClick={handleNext}
              style={{ fontSize: "1.5rem", padding: "0.5rem 2rem", cursor: "pointer" }}
            >
              Dalje
            </button>
          </div>
        </div>
      )}

      {step === 2 && !submitted && (
        <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src="/optionA.jpg"
              alt="Dečak"
              width={250}
              style={{ cursor: "pointer" }}
              onClick={() => handleVote("optionA")}
            />
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src="/optionB.jpg"
              alt="Devojčica"
              width={250}
              style={{ cursor: "pointer" }}
              onClick={() => handleVote("optionB")}
            />
          </div>
        </div>
      )}

      {submitted && (
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "2rem" }}>{getThankYouMessage()}</h2>
          {canShowResults ? (
            <div style={{ maxWidth: "400px", margin: "0 auto" }}>
              <Pie data={data} />
            </div>
          ) : (
            <p style={{ fontSize: "1.2rem" }}>Rezultati će biti objavljeni u sredu u 20h.</p>
          )}
        </div>
      )}
    </div>
  );
}

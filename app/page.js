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
    labels: ["Decak", "Devojcica"],
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
      return "Znam da bi voleo/a da sam Decak ali ja sam DEVOJCICA ❤️";
    } else if (vote === "optionB") {
      return "Jeste, ja sam DEVOJCICA ❤️";
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
      {!submitted && step === 1 && (
        <div
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: "3rem",
            borderRadius: "1rem",
            display: "inline-block",
          }}
        >
          <h1 style={{ fontSize: "3rem", marginBottom: "2rem" }}>
            Unesite ime i prezime
          </h1>
          <input
            placeholder="Ime"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              fontSize: "1.5rem",
              marginRight: "1rem",
              padding: "0.5rem",
              textAlign: "center",
            }}
          />
          <input
            placeholder="Prezime"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            style={{
              fontSize: "1.5rem",
              padding: "0.5rem",
              textAlign: "center",
            }}
          />
          <div style={{ marginTop: "2rem" }}>
            <button
              onClick={handleNext}
              style={{
                fontSize: "1.5rem",
                padding: "0.5rem 2rem",
                cursor: "pointer",
              }}
            >
              Dalje
            </button>
          </div>
        </div>
      )}

      {!submitted && step === 2 && (
        <div style={{ display: "flex", width: "100vw", justifyContent: "center", alignItems: "center" }}>
          <img
            src="/optionA.jpg"
            alt="Decak"
            width={250}
            height={250}
            style={{ cursor: "pointer", marginRight: "2rem" }}
            onClick={() => handleVote("optionA")}
          />
          <img
            src="/devojcica.jpg"
            alt="Devojcica"
            width={250}
            height={250}
            style={{ cursor: "pointer" }}
            onClick={() => handleVote("optionB")}
          />
        </div>
      )}

      {submitted && (
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem" }}>{getThankYouMessage()}</h2>
          {canShowResults ? (
            <div style={{ maxWidth: "500px", margin: "2rem auto" }}>
              <Pie data={data} />
            </div>
          ) : (
            <p style={{ fontSize: "1.5rem" }}>Rezultati će biti objavljeni u sredu u 20h.</p>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Home() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [step, setStep] = useState(1);
  const [vote, setVote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState({ optionA: 0, optionB: 0 });

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
      console.error(err);
      alert("Greška prilikom slanja glasa");
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch("/api/vote");
        const data = await res.json();
        if (data.results) setResults(data.results);
      } catch (err) {
        console.error(err);
      }
    };

    if (submitted) fetchResults();
  }, [submitted]);

  const pieData = {
    labels: ["Opcija A", "Opcija B"],
    datasets: [
      {
        data: [results.optionA, results.optionB],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: 'url("/background.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        color: "#fff",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      {/* Step 1: Unos imena i prezimena */}
      {step === 1 && (
        <div
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: "3rem",
            borderRadius: "1rem",
          }}
        >
          <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>
            Unesi ime i prezime
          </h1>
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

      {/* Step 2: Opcije */}
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
              alt="Opcija A"
              width={250}
              height={250}
              style={{ cursor: "pointer", objectFit: "cover" }}
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
              alt="Opcija B"
              width={250}
              height={250}
              style={{ cursor: "pointer", objectFit: "cover" }}
              onClick={() => handleVote("optionB")}
            />
          </div>
        </div>
      )}

      {/* Step 3: Prikaz rezultata */}
      {submitted && (
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
            Hvala na glasu, {name} {surname}!
          </h2>
          <div style={{ width: "300px", margin: "0 auto" }}>
            <Pie data={pieData} />
          </div>
        </div>
      )}
    </div>
  );
}

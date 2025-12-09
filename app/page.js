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
      alert("Bitte geben Sie Ihren Vor- und Nachnamen ein!");
      return;
    }
    setStep(2);
  };

  const handleVote = async (option) => {
    if (!name || !surname) {
      alert("Bitte geben Sie Ihren Vor- und Nachnamen ein!");
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
      console.error("Fehler beim Senden der Stimme:", err);
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
        console.error("Fehler beim Laden der Stimmen:", err);
      }
    };

    fetchResults();
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, []);

  const data = {
    labels: ["Junge", "Mädchen"],
    datasets: [
      {
        label: "Stimmen",
        data: [results.optionA, results.optionB],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  const getThankYouMessage = () => {
    if (vote === "optionA") {
      return "Ich weiß, dass Sie vielleicht hoffen, dass ich ein Junge bin… aber ich bin ein MÄDCHEN ❤️";
    } else if (vote === "optionB") {
      return "Ja, ich bin ein MÄDCHEN ❤️";
    }
    return `Danke für Ihre Stimme, ${name} ${surname}!`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: 'url("/background.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "Arial, sans-serif",
        color: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "2rem",
        flexDirection: "column",
      }}
    >
      {/* Seite 1 – Eingabe */}
      {!submitted && step === 1 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "90%",
            maxWidth: "500px",
          }}
        >
          <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", color: "#000" }}>
            Bitte Vor- und Nachnamen eingeben
          </h1>
          <input
            placeholder="Vorname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              fontSize: "1.2rem",
              marginBottom: "1rem",
              padding: "0.5rem",
              textAlign: "center",
              width: "100%",
            }}
          />
          <input
            placeholder="Nachname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            style={{
              fontSize: "1.2rem",
              marginBottom: "2rem",
              padding: "0.5rem",
              textAlign: "center",
              width: "100%",
            }}
          />
          <button
            onClick={handleNext}
            style={{
              fontSize: "1.2rem",
              padding: "0.5rem 2rem",
              cursor: "pointer",
              color: "#000",
            }}
          >
            Weiter
          </button>
        </div>
      )}

      {/* Seite 2 – Bilder */}
      {!submitted && step === 2 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            minHeight: "100vh",
            justifyContent: "center",
          }}
        >
          <h2 style={{ color: "#000", marginBottom: "2rem", fontSize: "1.8rem" }}>
            Was denkst du, was es ist? (Klicke auf das Bild)
          </h2>

          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
            }}
          >
            {/* Linke Seite */}
            <div
              style={{
                flex: 1,
                textAlign: "center",
              }}
            >
              <h3 style={{ color: "#000", marginBottom: "1rem" }}>Junge</h3>
              <img
                src="/optionA.jpg"
                alt="Junge"
                style={{
                  cursor: "pointer",
                  width: "250px",
                  height: "250px",
                  objectFit: "cover",
                }}
                onClick={() => handleVote("optionA")}
              />
            </div>

            {/* Rechte Seite */}
            <div
              style={{
                flex: 1,
                textAlign: "center",
              }}
            >
              <h3 style={{ color: "#000", marginBottom: "1rem" }}>Mädchen</h3>
              <img
                src="/devojcica.jpg"
                alt="Mädchen"
                style={{
                  cursor: "pointer",
                  width: "250px",
                  height: "250px",
                  objectFit: "cover",
                }}
                onClick={() => handleVote("optionB")}
              />
            </div>
          </div>
        </div>
      )}

      {/* Danke + Ergebnisse */}
      {submitted && (
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#000" }}>
            {getThankYouMessage()}
          </h2>
          {canShowResults ? (
            <div style={{ maxWidth: "400px", margin: "0 auto" }}>
              <Pie data={data} />
            </div>
          ) : (
            <p style={{ fontSize: "1rem", color: "#000" }}>
              Die Ergebnisse werden am Mittwoch um 20 Uhr veröffentlicht.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

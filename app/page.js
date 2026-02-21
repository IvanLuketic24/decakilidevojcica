"use client";

import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [vote, setVote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);

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
      if (data?.error) alert(data.error);
    } catch (err) {
      console.error("Fehler beim Senden der Stimme:", err);
    }
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
      {/* Step 1 – Ime/Prezime */}
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

      {/* Step 2 – Glasanje (2 slike) */}
      {!submitted && step === 2 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            minHeight: "100vh",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h2 style={{ color: "#000", marginBottom: "2rem", fontSize: "1.8rem" }}>
            Was denkst du, was es ist? (Klicke auf das Bild)
          </h2>

          <div
            style={{
              display: "flex",
              gap: "2rem",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ textAlign: "center" }}>
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

            <div style={{ textAlign: "center" }}>
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

      {/* Final – poruka */}
      {submitted && (
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#000" }}>
            {getThankYouMessage()}
          </h2>
        </div>
      )}
    </div>
  );
}

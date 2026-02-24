import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#0b0f19",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* LOGO */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <img
            src="/icon.png"
            alt="Dečak ili Devojčica logo"
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              display: "block",
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            }}
          />
        </div>

        {/* Tvoj header */}
        <p style={{ color: "rgba(255,255,255,0.75)", margin: 0, fontSize: 14, textAlign: "center" }}>
          Dobrodošli,
        </p>
        <h1
          style={{
            color: "white",
            fontSize: 30,
            fontWeight: 900,
            margin: "6px 0 18px",
            textAlign: "center",
          }}
        >
          Dečak ili Devojčica
        </h1>

        {/* Clerk */}
        <div
          style={{
            borderRadius: 18,
            padding: 16,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(10px)",
          }}
        >
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl="/dashboard"
            appearance={{
              elements: {
                // ukloni Clerk header/footer/branding tekstove
                header: { display: "none" },
                headerTitle: { display: "none" },
                headerSubtitle: { display: "none" },
                footer: { display: "none" },
                badge: { display: "none" },

                // ukloni social + "or"
                socialButtonsBlock: { display: "none" },
                socialButtons: { display: "none" },
                dividerRow: { display: "none" },
                dividerText: { display: "none" },

                // wrapper
                card: { boxShadow: "none", background: "transparent", border: "none", padding: 0 },

                // polja - belo
                formFieldLabel: { color: "rgba(255,255,255,0.85)" },
                formFieldInput: {
                  borderRadius: "14px",
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: "white",
                  color: "#111827",
                },

                // dugme
                formButtonPrimary: { borderRadius: "14px", marginTop: 10 },

                // sakrij Clerk-ov "Već imaš nalog?" (mi imamo svoj ispod)
                footerAction: { display: "none" },
                footerActionLink: { display: "none" },
              },
              variables: {
                colorPrimary: "#111827",
                colorBackground: "transparent",
                colorText: "white",
                borderRadius: "14px",
              },
            }}
          />
        </div>

        {/* Tvoj link ispod */}
        <p style={{ marginTop: 14, color: "rgba(255,255,255,0.75)", textAlign: "center" }}>
          Ako nemaš nalog,{" "}
          <a href="/sign-up" style={{ color: "white", textDecoration: "underline" }}>
            napravi ga ovde
          </a>
          .
        </p>
      </div>
    </main>
  );
}
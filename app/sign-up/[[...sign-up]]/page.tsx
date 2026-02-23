import { SignUp } from "@clerk/nextjs";

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
        {/* Tvoj header */}
        <p style={{ color: "rgba(255,255,255,0.75)", margin: 0, fontSize: 14 }}>
          Dobrodošli,
        </p>
        <h1 style={{ color: "white", fontSize: 30, fontWeight: 900, margin: "6px 0 18px" }}>
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
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            afterSignUpUrl="/dashboard"
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

                // sakrij First/Last name redove
                formFieldRow__firstName: { display: "none" },
                formFieldRow__lastName: { display: "none" },

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
        <p style={{ marginTop: 14, color: "rgba(255,255,255,0.75)" }}>
          Već imaš nalog?{" "}
          <a href="/sign-in" style={{ color: "white", textDecoration: "underline" }}>
            Uloguj se
          </a>
          .
        </p>
      </div>
    </main>
  );
}
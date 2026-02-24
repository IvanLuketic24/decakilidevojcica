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
      <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
        
        {/* LOGO */}
        <img
          src="/icon.png"
          alt="Dečak ili Devojčica logo"
          style={{
            width: 214,
            height: 214,
            objectFit: "contain",
            margin: "0 auto 24px",
            display: "block",
          }}
        />

        {/* HEADER */}
        <p
          style={{
            color: "rgba(255,255,255,0.75)",
            margin: 0,
            fontSize: 14,
          }}
        >
          Dobrodošli,
        </p>

        <h1
          style={{
            color: "white",
            fontSize: 30,
            fontWeight: 900,
            margin: "6px 0 18px",
          }}
        >
          Dečak ili Devojčica
        </h1>

        {/* CLERK BOX */}
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
                header: { display: "none" },
                headerTitle: { display: "none" },
                headerSubtitle: { display: "none" },
                footer: { display: "none" },
                badge: { display: "none" },

                socialButtonsBlock: { display: "none" },
                socialButtons: { display: "none" },
                dividerRow: { display: "none" },
                dividerText: { display: "none" },

                card: {
                  boxShadow: "none",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                },

                formFieldLabel: {
                  color: "rgba(255,255,255,0.9)",
                  paddingLeft: "16px",
                },

                formFieldInput: {
                  borderRadius: "14px",
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: "white",
                  color: "#111827",
                  paddingLeft: "12px",
                },

                formButtonPrimary: {
                  borderRadius: "14px",
                  marginTop: 12,
                },

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

        {/* LINK ISPOD */}
        <p
          style={{
            marginTop: 14,
            color: "rgba(255,255,255,0.75)",
          }}
        >
          Ako nemaš nalog,{" "}
          <a
            href="/sign-up"
            style={{ color: "white", textDecoration: "underline" }}
          >
            napravi ga ovde
          </a>
          .
        </p>
      </div>
    </main>
  );
}
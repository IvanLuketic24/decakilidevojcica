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
        <p style={{ color: "rgba(255,255,255,0.75)", margin: 0, fontSize: 14 }}>
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

        <div
          style={{
            borderRadius: 18,
            padding: 18,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.16)",
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

                formFieldRow__firstName: { display: "none" },
                formFieldRow__lastName: { display: "none" },

                formFieldLabel: {
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 14,
                  marginBottom: 6,
                },

                formFieldInput: {
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.22)",
                  background: "rgba(0,0,0,0.35)",
                  color: "white",
                  padding: "14px 14px",
                  fontSize: 16,
                },

                /* ✅ OTP (6 kockica za kod) */
                otpCodeField: {
                  gap: "10px",
                  justifyContent: "center",
                },

                otpCodeFieldInput: {
                  width: "48px",
                  height: "56px",
                  background: "white",
                  color: "#111827",
                  borderRadius: "14px",
                  border: "2px solid #ffffff",
                  fontSize: "22px",
                  fontWeight: 700,
                },

                otpCodeFieldInput__focus: {
                  outline: "none",
                  boxShadow: "0 0 0 3px rgba(255,255,255,0.4)",
                },

                formResendCodeLink: {
                  color: "white",
                  textDecoration: "underline",
                  fontWeight: 700,
                },

                formButtonPrimary: {
                  borderRadius: "16px",
                  marginTop: 16,
                  padding: "12px 14px",
                  fontSize: 16,
                  fontWeight: 800,
                  background: "white",
                  color: "#0b0f19",
                },

                footerAction: { display: "none" },
                footerActionLink: { display: "none" },

                formFieldInputShowPasswordButton: {
                  color: "rgba(255,255,255,0.85)",
                },

                formFieldErrorText: {
                  color: "#fecaca",
                  fontWeight: 600,
                },
              },
              variables: {
                colorPrimary: "#ffffff",
                colorBackground: "transparent",
                colorText: "white",
                borderRadius: "16px",
              },
            }}
          />
        </div>

        <p style={{ marginTop: 14, color: "rgba(255,255,255,0.75)" }}>
          Već imaš nalog?{" "}
          <a
            href="/sign-in"
            style={{ color: "white", textDecoration: "underline" }}
          >
            Uloguj se
          </a>
          .
        </p>
      </div>
    </main>
  );
}
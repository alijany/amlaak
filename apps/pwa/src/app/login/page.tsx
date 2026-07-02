import LoginModal from "@/components/auth/auth.component.modal";

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--slate-50)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Rose radial glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "70vw",
          height: "70vw",
          maxWidth: 900,
          maxHeight: 900,
          background:
            "radial-gradient(60% 60% at 60% 40%, color-mix(in srgb, var(--rose-500) 14%, transparent) 0%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      {/* Dot texture */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(color-mix(in srgb, var(--rose-500) 15%, transparent) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 460, padding: "0 16px" }}>
        <LoginModal />
      </div>
    </div>
  );
}

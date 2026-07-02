"use client";

import { useState } from "react";
import { PRESET_COLORS, useTheme } from "./theme.context.provider";

export function ThemeColorPicker() {
  const { primaryColor, setPrimaryColor } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
      }}
    >
      {open && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: "14px 16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            minWidth: 180,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 0.5, marginBottom: 2 }}>
            رنگ اصلی
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                title={c.label}
                onClick={() => setPrimaryColor(c.value)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: c.value,
                  border: primaryColor === c.value ? "3px solid #1F2A44" : "2px solid transparent",
                  cursor: "pointer",
                  outline: "none",
                  transition: "transform .1s",
                  transform: primaryColor === c.value ? "scale(1.15)" : "scale(1)",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
            <label style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, whiteSpace: "nowrap" }}>
              سفارشی:
            </label>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              style={{
                width: 36,
                height: 28,
                border: "1px solid #d1d5db",
                borderRadius: 6,
                padding: 2,
                cursor: "pointer",
                background: "transparent",
              }}
            />
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        title="تغییر رنگ"
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: primaryColor,
          border: "3px solid #fff",
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform .15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="13.5" cy="6.5" r="2.5" />
          <circle cx="17.5" cy="10.5" r="2.5" />
          <circle cx="8.5" cy="7.5" r="2.5" />
          <circle cx="6.5" cy="12.5" r="2.5" />
          <path d="M12 20a8 8 0 0 0 8-8H4a8 8 0 0 0 8 8z" />
        </svg>
      </button>
    </div>
  );
}

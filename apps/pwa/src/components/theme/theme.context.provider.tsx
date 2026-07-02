"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "app-primary-color";

export const PRESET_COLORS = [
  { label: "رز", value: "#FC4258" },
  { label: "آبی", value: "#3B82F6" },
  { label: "بنفش", value: "#8B5CF6" },
  { label: "سبز", value: "#10B981" },
  { label: "نارنجی", value: "#F97316" },
  { label: "فیروزه‌ای", value: "#06B6D4" },
];

interface ThemeContextValue {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  primaryColor: "#FC4258",
  setPrimaryColor: () => {},
});

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lighten(hex: string, factor: number): string {
  const [r, g, b] = hexToRgb(hex);
  const blend = (c: number) => Math.round(c + (255 - c) * factor);
  return `rgb(${blend(r)}, ${blend(g)}, ${blend(b)})`;
}

function darken(hex: string, factor: number): string {
  const [r, g, b] = hexToRgb(hex);
  const blend = (c: number) => Math.round(c * (1 - factor));
  return `rgb(${blend(r)}, ${blend(g)}, ${blend(b)})`;
}

function applyPrimaryColor(color: string) {
  const root = document.documentElement;
  root.style.setProperty("--rose-50",  lighten(color, 0.94));
  root.style.setProperty("--rose-100", lighten(color, 0.88));
  root.style.setProperty("--rose-200", lighten(color, 0.76));
  root.style.setProperty("--rose-300", lighten(color, 0.56));
  root.style.setProperty("--rose-400", lighten(color, 0.28));
  root.style.setProperty("--rose-500", color);
  root.style.setProperty("--rose-600", darken(color, 0.12));
  root.style.setProperty("--rose-700", darken(color, 0.30));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColorState] = useState("#FC4258");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPrimaryColorState(saved);
      applyPrimaryColor(saved);
    }
  }, []);

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color);
    localStorage.setItem(STORAGE_KEY, color);
    applyPrimaryColor(color);
  };

  return (
    <ThemeContext.Provider value={{ primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

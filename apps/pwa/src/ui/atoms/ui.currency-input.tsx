"use client";

import React, { useState, useEffect } from "react";
import { Input } from "./ui.input";

type CurrencyInputProps = Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> & {
  value?: number | null; // numeric value in rials
  onValueChange?: (value: number | null) => void; // expose numeric value
};

// Format number with thousands separator (EN digits). We keep digits in english to avoid RTL issues.
function formatNumber(value: number | null) {
  if (value == null || Number.isNaN(value)) return "";
  return value.toLocaleString('en-US');
}

function parseNumberFromString(s: string) {
  if (!s) return null;
  // Remove all non digit characters
  const onlyDigits = s.replace(/[^0-9]/g, '');
  if (!onlyDigits) return null;
  // parse as integer (rials)
  const n = Number(onlyDigits);
  return Number.isFinite(n) ? n : null;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ value = null, onValueChange, ...props }) => {
  const [display, setDisplay] = useState<string>(formatNumber(value));

  // Keep display in sync when parent updates numeric value
  useEffect(() => {
  setDisplay(formatNumber(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // try to parse numeric value from user input
    const parsed = parseNumberFromString(raw);
    // update display formatted
    setDisplay(formatNumber(parsed));
    // forward numeric value
    onValueChange?.(parsed);
  };

  const handleBlur = () => {
    // reformat on blur (already formatted in change)
    setDisplay((prev) => {
      // keep as is
      return prev;
    });
  };

  return (
    <Input
      {...(props as Record<string, unknown>)}
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};

export default CurrencyInput;

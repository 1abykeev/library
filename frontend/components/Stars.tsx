"use client";

import { useState } from "react";

export function Stars({
  value,
  size = "md",
  count,
}: {
  value: number;
  size?: "sm" | "md" | "lg";
  count?: number;
}) {
  const full = Math.round(value);
  const sz = size === "sm" ? "text-xs" : size === "lg" ? "text-lg" : "text-sm";
  return (
    <span className={`inline-flex items-center gap-1 ${sz}`}>
      <span className="tracking-[0.15em] text-amber-500">
        {"★★★★★".slice(0, full)}
        <span className="text-ink-200">{"★★★★★".slice(full)}</span>
      </span>
      {value > 0 && <span className="font-medium text-ink-900">{value.toFixed(1)}</span>}
      {count !== undefined && count > 0 && (
        <span className="text-ink-600">({count})</span>
      )}
    </span>
  );
}

export function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div className="flex gap-1 text-3xl leading-none" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          className={`transition ${n <= active ? "text-amber-500" : "text-ink-200"} hover:scale-110`}
          aria-label={`${n} звёзд`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

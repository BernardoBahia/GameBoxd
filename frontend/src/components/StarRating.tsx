"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────
// StarRating – interactive star picker (1–5)
// ──────────────────────────────────────────────
export interface StarRatingProps {
  value: number; // 0 = sem seleção, 1-5
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export function StarRating({
  value,
  onChange,
  disabled,
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const active = hovered > 0 ? hovered : value;

  return (
    <div
      className={cn("flex w-full items-center justify-between", className)}
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          aria-label={`${star} estrela${star !== 1 ? "s" : ""}`}
          className={cn(
            "flex-1 text-4xl leading-none transition-all duration-75 select-none text-center",
            "disabled:cursor-not-allowed disabled:opacity-50",
            active >= star
              ? "text-yellow-400 scale-110 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]"
              : "text-zinc-600 hover:text-yellow-400/60",
          )}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// StarDisplay – read-only star display (0–5)
// ──────────────────────────────────────────────
export interface StarDisplayProps {
  rating: number; // 0-5, aceita decimais
  size?: "xs" | "sm" | "md";
  showNumber?: boolean;
  className?: string;
}

export function StarDisplay({
  rating,
  size = "sm",
  showNumber = false,
  className,
}: StarDisplayProps) {
  const clamped = Math.min(5, Math.max(0, rating));
  const full = Math.floor(clamped);
  const hasHalf = clamped - full >= 0.25 && clamped - full < 0.75;
  const roundedUp = clamped - full >= 0.75;
  const actualFull = full + (roundedUp ? 1 : 0);
  const empty = 5 - actualFull - (hasHalf ? 1 : 0);

  const sizeClass = { xs: "text-xs", sm: "text-sm", md: "text-base" }[size];

  return (
    <div className={cn("flex items-center gap-px", sizeClass, className)}>
      {Array.from({ length: actualFull }).map((_, i) => (
        <span key={`f${i}`} className="text-yellow-400 leading-none">
          ★
        </span>
      ))}
      {hasHalf && (
        <span className="text-yellow-400/50 leading-none">★</span>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e${i}`} className="text-zinc-600 leading-none">
          ★
        </span>
      ))}
      {showNumber && (
        <span className="ml-1.5 text-zinc-400 tabular-nums">
          {clamped.toFixed(1)}
        </span>
      )}
    </div>
  );
}

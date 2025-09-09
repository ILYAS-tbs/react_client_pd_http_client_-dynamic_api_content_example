import React from "react";

/**
 * QuickCircularSpinner.jsx
 * Single-file React component (default export).
 * Tailwind-friendly — uses `animate-spin` if Tailwind is available.
 * Props:
 *   - size (number) : diameter in px (default 32)
 *   - thickness (number) : stroke width in px (default 3)
 *   - className (string) : extra classes to apply to svg container
 *   - ariaLabel (string) : accessible label (default: "Loading")
 *
 * Usage:
 *   import Spinner from "./QuickCircularSpinner";
 *   <Spinner size={48} thickness={4} className="text-indigo-600" />
 */

export default function Spinner({
  size = 32,
  thickness = 3,
  className = "",
  ariaLabel = "Loading",
}) {
  const stroke = thickness;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  // Inline styles as a fallback if Tailwind 'animate-spin' isn't available
  const fallbackStyle = {
    animation: "spin 1s linear infinite",
  };

  return (
    <svg
      role="status"
      aria-label={ariaLabel}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`inline-block ${className}`}
      style={!className.includes("animate-spin") ? fallbackStyle : undefined}
    >
      <defs>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </defs>

      {/* Background circle (faint) */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        stroke="currentColor"
        strokeOpacity="0.15"
        strokeWidth={stroke}
        fill="none"
      />

      {/* Foreground arc */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * 0.25}
        transform={`rotate(-90 ${cx} ${cy})`}
        className="animate-spin"
      />
    </svg>
  );
}

/*
  Notes:
  - This spinner uses `currentColor`, so you can color it via text color utilities
    (e.g. `text-gray-500`, `text-indigo-600`) or inline style.
  - If you have Tailwind, `animate-spin` will be used automatically. If not,
    the component injects a tiny `@keyframes spin` and an inline animation style.
  - To change speed, replace `1s` in the fallbackStyle animation or add a class
    that overrides it (e.g. `style={{ animationDuration: '0.6s' }}`).
*/

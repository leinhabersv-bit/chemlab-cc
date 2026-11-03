"use client";

import React from "react";

interface ConicalFlaskProps {
  fillPercentage: number; // 0 to 100
  liquidColor?: string; // CSS color string e.g. "rgba(114, 47, 55, 0.85)" for wine red, "rgba(70, 130, 180, 0.85)" for steel blue
  liquidName?: string;
  isStirring?: boolean;
  hasPrecipitate?: boolean;
  precipitateColor?: string;
  volumeDisplayMl?: number;
  onToggleStirrer?: () => void;
  className?: string;
}

export const ConicalFlask: React.FC<ConicalFlaskProps> = ({
  fillPercentage,
  liquidColor = "rgba(114, 47, 55, 0.85)", // default wine red
  liquidName = "Sample + Buffer + EBT",
  isStirring = false,
  hasPrecipitate = false,
  precipitateColor = "rgba(255, 255, 255, 0.7)",
  volumeDisplayMl = 25,
  onToggleStirrer,
  className = "",
}) => {
  const clampedFill = Math.min(Math.max(fillPercentage, 5), 90);
  // Flask height in SVG coordinate system:
  // Flask base: y = 200, Flask neck start: y = 80, Neck top: y = 30
  // Fill height maps from y = 195 (almost empty) to y = 90 (full)
  const liquidTopY = 195 - (clampedFill / 100) * 110;

  return (
    <div className={`flex flex-col items-center bg-lab-900/60 p-4 rounded-xl border border-lab-700/60 shadow-lg text-slate-100 ${className}`}>
      <div className="flex items-center justify-between w-full mb-1 text-xs font-mono text-slate-400">
        <span className="font-semibold text-amber-400">CONICAL FLASK (250 mL)</span>
        <span className="bg-lab-800 px-2 py-0.5 rounded border border-lab-700 text-slate-300">
          Vol: <strong className="text-amber-300 font-mono text-sm">{volumeDisplayMl.toFixed(1)}</strong> mL
        </span>
      </div>

      <div className="text-[11px] text-slate-400 mb-2 truncate max-w-[200px]" title={liquidName}>
        Content: <span className="text-slate-200">{liquidName}</span>
      </div>

      {/* SVG Erlenmeyer Flask */}
      <div className="relative w-44 h-52 flex justify-center items-center">
        <svg viewBox="0 0 200 230" className="w-44 h-52 overflow-visible drop-shadow-lg">
          <defs>
            <linearGradient id="flaskGlassReflect" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="20%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="80%" stopColor="rgba(255,255,255,0.02)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
            </linearGradient>
            <clipPath id="flaskInteriorClip">
              {/* Outer boundary of flask for clipping liquid */}
              <path d="M 82 40 L 118 40 L 118 80 L 178 195 C 182 203 175 208 165 208 L 35 208 C 25 208 18 203 22 195 L 82 80 Z" />
            </clipPath>
          </defs>

          {/* Magnetic Stirrer Base Plate */}
          <rect x="15" y="210" width="170" height="16" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <circle cx="160" cy="218" r="3" fill={isStirring ? "#10b981" : "#64748b"} />

          {/* Liquid Clipped to Flask Interior */}
          <g clipPath="url(#flaskInteriorClip)">
            <rect
              x="10"
              y={liquidTopY}
              width="180"
              height={220 - liquidTopY}
              fill={liquidColor}
              className="transition-colors duration-500 ease-out"
            />
            {/* Liquid surface wave / meniscus */}
            <ellipse
              cx="100"
              cy={liquidTopY}
              rx={35 + (clampedFill / 100) * 35}
              ry="4"
              fill={liquidColor}
              opacity="0.9"
            />

            {/* Precipitate suspension / flakes if present */}
            {hasPrecipitate && (
              <g className={isStirring ? "animate-spin origin-[100px_180px]" : ""}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <circle
                    key={i}
                    cx={60 + (i * 23) % 80}
                    cy={150 + (i * 17) % 50}
                    r={1.2 + (i % 3) * 0.5}
                    fill={precipitateColor}
                    opacity={0.8}
                  />
                ))}
              </g>
            )}

            {/* Magnetic Stir Bar in bottom of flask */}
            <g
              transform="translate(100, 200)"
              className={isStirring ? "animate-spin" : ""}
            >
              <rect x="-14" y="-3.5" width="28" height="7" rx="3.5" fill="#f8fafc" stroke="#475569" strokeWidth="1" />
            </g>
          </g>

          {/* Flask Glass Outline and Neck */}
          <path
            d="M 80 35 L 120 35 L 120 40 L 118 40 L 118 80 L 178 195 C 184 206 174 210 165 210 L 35 210 C 26 210 16 206 22 195 L 82 80 L 82 40 L 80 40 Z"
            fill="url(#flaskGlassReflect)"
            stroke="rgba(203, 213, 225, 0.8)"
            strokeWidth="2"
          />

          {/* Graduations on Flask Wall */}
          <line x1="68" y1="165" x2="80" y2="165" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
          <text x="85" y="168" fill="rgba(255,255,255,0.8)" fontSize="8" fontFamily="monospace">50 mL</text>

          <line x1="77" y1="135" x2="88" y2="135" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
          <text x="93" y="138" fill="rgba(255,255,255,0.8)" fontSize="8" fontFamily="monospace">100 mL</text>

          <line x1="86" y1="105" x2="95" y2="105" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
          <text x="99" y="108" fill="rgba(255,255,255,0.8)" fontSize="8" fontFamily="monospace">150 mL</text>
        </svg>
      </div>

      {/* Stirrer Toggle */}
      {onToggleStirrer && (
        <button
          onClick={onToggleStirrer}
          className={`mt-2 px-3 py-1 text-xs font-mono rounded flex items-center gap-1.5 transition-all ${
            isStirring
              ? "bg-emerald-600/90 text-white shadow-sm ring-1 ring-emerald-400"
              : "bg-lab-800 text-slate-300 hover:bg-lab-700 border border-lab-700"
          }`}
        >
          <span className={`inline-block w-2 h-2 rounded-full ${isStirring ? "bg-emerald-300 animate-ping" : "bg-slate-500"}`} />
          {isStirring ? "Magnetic Stirrer: ON" : "Turn On Magnetic Stirrer"}
        </button>
      )}
    </div>
  );
};

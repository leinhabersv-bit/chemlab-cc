"use client";

import React from "react";

interface FlaskStirrerV2Props {
  fillVolumeMl: number; // e.g. 20 to 60 mL
  maxFlaskVolume?: number; // 250 mL
  liquidColor: string; // e.g. Wine Red, Steel Blue, transparent
  isStirring?: boolean;
  isReceivingStream?: boolean;
  onToggleStirrer?: () => void;
  className?: string;
}

export const FlaskStirrerV2: React.FC<FlaskStirrerV2Props> = ({
  fillVolumeMl,
  maxFlaskVolume = 250,
  liquidColor,
  isStirring = true,
  isReceivingStream = false,
  onToggleStirrer,
  className = "",
}) => {
  // Clamped volume percentage: 0 to 100
  const clampedVol = Math.min(Math.max(fillVolumeMl, 0), maxFlaskVolume);
  // Liquid height in SVG: flask base y = 145, flask neck y = 55. Height spans ~90px
  const fillFraction = clampedVol > 0 ? Math.min(clampedVol / 80, 1.0) : 0;
  const liquidTopY = 142 - fillFraction * 65;

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* 250 mL Conical Flask with Magnetic Stirrer Base */}
      <div className="relative w-48 h-56 flex justify-center items-center">
        <svg viewBox="0 0 200 220" className="w-full h-full overflow-visible drop-shadow-2xl">
          <defs>
            {/* Glass wall highlights */}
            <linearGradient id="flaskV2Glass" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
              <stop offset="15%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="85%" stopColor="rgba(255,255,255,0.03)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.35)" />
            </linearGradient>

            {/* Ceramic stirrer plate */}
            <linearGradient id="ceramicPlate" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="50%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            {/* Stirrer Chassis */}
            <linearGradient id="stirrerBody" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>

            {/* Flask internal clip */}
            <clipPath id="flaskV2Clip">
              <path d="M 86 35 L 114 35 L 114 65 L 165 146 C 168 150 162 153 154 153 L 46 153 C 38 153 32 150 35 146 L 86 65 Z" />
            </clipPath>
          </defs>

          {/* Magnetic Stirrer Base Unit */}
          {/* Main body */}
          <rect x="20" y="156" width="160" height="48" rx="6" fill="url(#stirrerBody)" stroke="#334155" strokeWidth="1.5" />
          
          {/* Ceramic Hotplate Top Surface */}
          <rect x="28" y="152" width="144" height="8" rx="3" fill="url(#ceramicPlate)" stroke="#94a3b8" strokeWidth="1" />

          {/* Stirrer front controls */}
          {/* Power status LED */}
          <circle cx="45" cy="180" r="3.5" fill={isStirring ? "#10b981" : "#475569"} className={isStirring ? "animate-pulse" : ""} />
          <text x="54" y="183" fill="#94a3b8" fontSize="7" fontFamily="monospace">PWR</text>

          {/* Speed dial */}
          <circle cx="100" cy="180" r="10" fill="#334155" stroke="#64748b" strokeWidth="1" />
          <line
            x1="100"
            y1="180"
            x2={isStirring ? "106" : "94"}
            y2={isStirring ? "174" : "186"}
            stroke="#f8fafc"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <text x="100" y="198" fill="#64748b" fontSize="6" fontFamily="monospace" textAnchor="middle">
            {isStirring ? "400 RPM" : "0 RPM"}
          </text>

          {/* Interactive Toggle switch on base */}
          <rect
            x="142"
            y="172"
            width="22"
            height="14"
            rx="3"
            fill={isStirring ? "#065f46" : "#334155"}
            stroke={isStirring ? "#10b981" : "#475569"}
            strokeWidth="1"
            className="cursor-pointer"
            onClick={onToggleStirrer}
          />
          <text
            x="153"
            y="182"
            fill={isStirring ? "#a7f3d0" : "#94a3b8"}
            fontSize="6"
            fontFamily="monospace"
            textAnchor="middle"
            className="cursor-pointer"
            onClick={onToggleStirrer}
          >
            {isStirring ? "ON" : "OFF"}
          </text>

          {/* Flask Interior Liquid (Clipped to Flask Wall) */}
          {clampedVol > 0 && (
            <g clipPath="url(#flaskV2Clip)">
              {/* Liquid Pool */}
              <rect
                x="20"
                y={liquidTopY}
                width="160"
                height={160 - liquidTopY}
                fill={liquidColor}
                className="transition-colors duration-300 ease-out"
              />

              {/* Surface Meniscus / Wave */}
              <ellipse
                cx="100"
                cy={liquidTopY}
                rx={24 + fillFraction * 32}
                ry={isStirring ? "4" : "2.5"}
                fill={liquidColor}
                className={isStirring ? "animate-pulse" : ""}
                opacity="0.95"
              />

              {/* Vortex Depression when Stirring */}
              {isStirring && (
                <ellipse
                  cx="100"
                  cy={liquidTopY + 2}
                  rx={8 + fillFraction * 6}
                  ry="2"
                  fill="rgba(0, 0, 0, 0.25)"
                />
              )}

              {/* Rotating Teflon Magnetic Stir Bar */}
              <g
                transform="translate(100, 148)"
                className={isStirring ? "animate-spin origin-center" : ""}
              >
                <rect x="-12" y="-3" width="24" height="6" rx="3" fill="#ffffff" stroke="#475569" strokeWidth="0.8" />
                <line x1="-3" y1="-3" x2="-3" y2="3" stroke="#94a3b8" strokeWidth="0.8" />
                <line x1="3" y1="-3" x2="3" y2="3" stroke="#94a3b8" strokeWidth="0.8" />
              </g>

              {/* Droplet Ripples when Receiving Stream */}
              {isReceivingStream && (
                <g>
                  <circle cx="100" cy={liquidTopY} r="6" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1" className="animate-ping" />
                  <circle cx="100" cy={liquidTopY} r="12" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
                </g>
              )}
            </g>
          )}

          {/* Flask Glass Outline & Rim */}
          <path
            d="M 84 32 L 116 32 L 116 36 L 114 36 L 114 65 L 165 146 C 170 152 163 154 154 154 L 46 154 C 37 154 30 152 35 146 L 86 65 L 86 36 L 84 36 Z"
            fill="url(#flaskV2Glass)"
            stroke="#cbd5e1"
            strokeWidth="1.6"
          />

          {/* Graduations on Flask Face */}
          <line x1="72" y1="126" x2="82" y2="126" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
          <text x="86" y="128.5" fill="rgba(255,255,255,0.8)" fontSize="7" fontFamily="monospace">50 mL</text>

          <line x1="78" y1="102" x2="88" y2="102" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
          <text x="92" y="104.5" fill="rgba(255,255,255,0.8)" fontSize="7" fontFamily="monospace">100 mL</text>

          <line x1="84" y1="78" x2="94" y2="78" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
          <text x="98" y="80.5" fill="rgba(255,255,255,0.8)" fontSize="7" fontFamily="monospace">150 mL</text>
        </svg>
      </div>

      {/* Volume & Solution Status Pill */}
      <div className="flex items-center gap-2 mt-1 px-3 py-1.5 bg-bench-900 border border-bench-750 rounded-xl text-xs font-mono shadow-md">
        <span
          className="w-3.5 h-3.5 rounded-full border border-bench-600 shadow-inner"
          style={{ backgroundColor: liquidColor === "transparent" ? "#222732" : liquidColor }}
        />
        <span className="text-enamel-200">
          Flask: <strong className="text-instrument-sky font-bold">{clampedVol.toFixed(1)} mL</strong>
        </span>
        <button
          onClick={onToggleStirrer}
          className={`text-[10px] px-2 py-0.5 rounded-md border font-bold transition-colors ${
            isStirring
              ? "bg-emerald-950 border-emerald-700 text-instrument-phosphor"
              : "bg-bench-800 border-bench-700 text-enamel-400 hover:text-white"
          }`}
        >
          {isStirring ? "STIRRER (ON)" : "STIRRER (OFF)"}
        </button>
      </div>
    </div>
  );
};


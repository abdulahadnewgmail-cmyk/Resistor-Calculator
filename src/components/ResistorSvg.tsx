import React from 'react';
import { BandCount, ColorKey } from '../types';
import { RCC_COLORS } from '../constants/resistorData';

interface ResistorSvgProps {
  bands: ColorKey[];
  bandCount: BandCount;
  activeBandIndex?: number | null;
  onSelectBandIndex?: (index: number) => void;
  className?: string;
}

export const ResistorSvg: React.FC<ResistorSvgProps> = ({
  bands,
  bandCount,
  activeBandIndex,
  onSelectBandIndex,
  className = '',
}) => {
  const digitCount = bandCount === 5 || bandCount === 6 ? 3 : 2;

  // Band positions along X-axis (total width 320, body width 200, from X=60 to X=260)
  // Body center X = 160
  const bandPositions = React.useMemo(() => {
    if (bandCount === 3) {
      return [90, 140, 210];
    }
    if (bandCount === 4) {
      return [85, 125, 165, 225];
    }
    if (bandCount === 5) {
      return [80, 115, 150, 185, 230];
    }
    // 6-band
    return [78, 110, 142, 174, 210, 240];
  }, [bandCount]);

  const getBandLabel = (index: number) => {
    if (index < digitCount) return `${index + 1}st Digit`;
    if (index === digitCount) return 'Multiplier';
    if (index === digitCount + 1) return 'Tolerance';
    return 'TCR (ppm/K)';
  };

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 320 100"
        className="w-full max-w-md h-auto drop-shadow-xl overflow-visible"
        style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.25))' }}
      >
        <defs>
          {/* Metal lead gradient */}
          <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d1d5db" />
            <stop offset="30%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#9ca3af" />
            <stop offset="100%" stopColor="#4b5563" />
          </linearGradient>

          {/* Resistor ceramic beige body gradient */}
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="15%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="85%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>

          {/* Blue precision body gradient for 5 & 6 band resistors */}
          <linearGradient id="blueBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="20%" stopColor="#bfdbfe" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="85%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>

          {/* Glossy top highlight overlay */}
          <linearGradient id="glossGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
          </linearGradient>

          {/* Band shadow filter */}
          <filter id="bandShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="0" stdDeviation="1" floodColor="#000000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Left Metal Wire Lead */}
        <rect x="0" y="44" width="65" height="12" rx="3" fill="url(#leadGrad)" />

        {/* Right Metal Wire Lead */}
        <rect x="255" y="44" width="65" height="12" rx="3" fill="url(#leadGrad)" />

        {/* Resistor Main Body Background */}
        {/* Left Bulb Cap */}
        <path
          d="M 60 50 C 60 20, 80 22, 90 25 L 90 75 C 80 78, 60 80, 60 50 Z"
          fill={bandCount >= 5 ? 'url(#blueBodyGrad)' : 'url(#bodyGrad)'}
        />

        {/* Center Cylinder */}
        <rect
          x="88"
          y="25"
          width="144"
          height="50"
          fill={bandCount >= 5 ? 'url(#blueBodyGrad)' : 'url(#bodyGrad)'}
        />

        {/* Right Bulb Cap */}
        <path
          d="M 260 50 C 260 20, 240 22, 230 25 L 230 75 C 240 78, 260 80, 260 50 Z"
          fill={bandCount >= 5 ? 'url(#blueBodyGrad)' : 'url(#bodyGrad)'}
        />

        {/* Body Top Glass Reflection Sheen */}
        <ellipse cx="160" cy="30" rx="95" ry="5" fill="#ffffff" opacity="0.35" />

        {/* Color Bands */}
        {bandPositions.map((posX, idx) => {
          if (idx >= bandCount) return null;
          const colorKey = bands[idx] || 'black';
          const colorDef = RCC_COLORS[colorKey] || RCC_COLORS['black'];
          const isSelected = activeBandIndex === idx;

          // Band width
          const isMultOrTol = idx >= digitCount;
          const bandW = isMultOrTol ? 14 : 11;

          return (
            <g
              key={idx}
              onClick={() => onSelectBandIndex && onSelectBandIndex(idx)}
              className="cursor-pointer transition-transform duration-200"
            >
              {/* Highlight selection halo behind band */}
              {isSelected && (
                <rect
                  x={posX - 3}
                  y="20"
                  width={bandW + 6}
                  height="60"
                  rx="4"
                  fill="#f97316"
                  opacity="0.8"
                  className="animate-pulse"
                />
              )}

              {/* Band rectangle */}
              <rect
                x={posX}
                y="23"
                width={bandW}
                height="54"
                rx="2"
                fill={colorDef.hex}
                filter="url(#bandShadow)"
                stroke={colorKey === 'white' ? '#cbd5e1' : 'none'}
                strokeWidth="1"
              />

              {/* Band gloss overlay */}
              <rect
                x={posX}
                y="23"
                width={bandW}
                height="54"
                rx="2"
                fill="url(#glossGrad)"
                opacity="0.4"
              />

              {/* Active Band Indicator Pointer */}
              {isSelected && (
                <polygon
                  points={`${posX + bandW / 2 - 5},15 ${posX + bandW / 2 + 5},15 ${posX + bandW / 2},22`}
                  fill="#f97316"
                />
              )}
            </g>
          );
        })}

        {/* Resistor Body Bottom Shadow */}
        <ellipse cx="160" cy="72" rx="90" ry="3" fill="#000000" opacity="0.25" />
      </svg>

      {/* Band Labels Bar */}
      <div className="flex items-center justify-around w-full max-w-md mt-2 px-2">
        {bandPositions.map((_, idx) => {
          if (idx >= bandCount) return null;
          const colorKey = bands[idx] || 'black';
          const colorDef = RCC_COLORS[colorKey];
          const isSelected = activeBandIndex === idx;

          return (
            <button
              key={idx}
              onClick={() => onSelectBandIndex && onSelectBandIndex(idx)}
              className={`flex flex-col items-center px-1.5 py-1 rounded-lg transition-all text-xs ${
                isSelected
                  ? 'bg-orange-500/20 text-orange-400 font-bold ring-1 ring-orange-500'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <div
                className="w-4 h-3 rounded-xs border border-slate-700 shadow-xs mb-0.5"
                style={{ backgroundColor: colorDef?.hex }}
              />
              <span className="text-[10px] uppercase tracking-wider">{getBandLabel(idx)}</span>
              <span className="font-semibold text-slate-200 truncate max-w-[55px]">
                {colorDef?.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';

interface SmdChipSvgProps {
  codeStr: string;
  formattedResistance: string;
  packageSize?: string;
  className?: string;
}

export const SmdChipSvg: React.FC<SmdChipSvgProps> = ({
  codeStr,
  formattedResistance,
  packageSize = '1206',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative flex items-center justify-center p-4">
        {/* Realistic SMD Chip Component SVG */}
        <svg
          viewBox="0 0 240 120"
          className="w-56 h-auto drop-shadow-2xl overflow-visible"
          style={{ filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.45))' }}
        >
          <defs>
            {/* Metallic Solder Cap End Gradients */}
            <linearGradient id="metalSilverGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="35%" stopColor="#f8fafc" />
              <stop offset="70%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>

            {/* Dark Ceramic Encapsulation Body */}
            <linearGradient id="ceramicBodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="25%" stopColor="#1e293b" />
              <stop offset="75%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* Subtle top bevel sheen */}
            <linearGradient id="bevelGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* PCB Copper Pad Shadow underneath */}
          <rect x="10" y="25" width="220" height="70" rx="10" fill="#000000" opacity="0.3" />

          {/* Left Silver Solder End Cap */}
          <path
            d="M 20 20 L 50 20 L 50 100 L 20 100 C 14 100, 10 94, 10 86 L 10 34 C 10 26, 14 20, 20 20 Z"
            fill="url(#metalSilverGrad)"
            stroke="#475569"
            strokeWidth="1"
          />

          {/* Right Silver Solder End Cap */}
          <path
            d="M 190 20 L 220 20 C 226 20, 230 26, 230 34 L 230 86 C 230 94, 226 100, 220 100 L 190 100 Z"
            fill="url(#metalSilverGrad)"
            stroke="#475569"
            strokeWidth="1"
          />

          {/* Ceramic Resistor Main Body */}
          <rect
            x="48"
            y="20"
            width="144"
            height="80"
            rx="6"
            fill="url(#ceramicBodyGrad)"
            stroke="#0f172a"
            strokeWidth="1.5"
          />

          {/* Ceramic Inner Bevel Frame */}
          <rect
            x="52"
            y="24"
            width="136"
            height="72"
            rx="4"
            fill="url(#bevelGrad)"
            opacity="0.3"
          />

          {/* Laser-Etched Text Display */}
          <text
            x="120"
            y="68"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#e2e8f0"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
            fontSize="34"
            fontWeight="900"
            letterSpacing="3"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 2px rgba(255,255,255,0.2)',
            }}
          >
            {codeStr || '473'}
          </text>
        </svg>

        {/* Footprint / Size Badge */}
        <div className="absolute top-1 right-2 bg-slate-800/80 border border-slate-700/80 text-slate-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
          SMD {packageSize}
        </div>
      </div>

      <div className="text-center font-black text-2xl tracking-tight text-orange-400 bg-slate-900/90 border border-slate-800 px-6 py-2 rounded-2xl shadow-inner mt-1">
        {formattedResistance}
      </div>
    </div>
  );
};

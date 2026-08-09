import React, { useState, useEffect } from 'react';
import { BandCount, ColorKey, ResistorCalculation } from '../types';
import {
  DIGIT_COLOR_KEYS,
  MULTIPLIER_COLOR_KEYS,
  RCC_COLORS,
  TCR_COLOR_KEYS,
  TOLERANCE_COLOR_KEYS,
} from '../constants/resistorData';
import { calculateRcc } from '../utils/resistorCalc';
import { ResistorSvg } from './ResistorSvg';
import { Bookmark, Copy, Check, Sparkles } from 'lucide-react';

interface RccCalculatorProps {
  onSave: (calc: ResistorCalculation) => void;
  playClick: () => void;
  triggerHaptic: () => void;
}

export const RccCalculator: React.FC<RccCalculatorProps> = ({
  onSave,
  playClick,
  triggerHaptic,
}) => {
  const [bandCount, setBandCount] = useState<BandCount>(4);
  const [bands, setBands] = useState<ColorKey[]>(['yellow', 'violet', 'red', 'gold']);
  const [activeBandIdx, setActiveBandIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  // Sync bands array length on bandCount change
  useEffect(() => {
    setBands((prev) => {
      const defaults: Record<BandCount, ColorKey[]> = {
        3: ['blue', 'grey', 'brown'],
        4: ['yellow', 'violet', 'red', 'gold'],
        5: ['blue', 'grey', 'black', 'brown', 'gold'],
        6: ['blue', 'grey', 'black', 'brown', 'gold', 'brown'],
      };
      return defaults[bandCount] || prev;
    });
    setActiveBandIdx(0);
  }, [bandCount]);

  const digitCount = bandCount === 5 || bandCount === 6 ? 3 : 2;
  const result = calculateRcc(bands, bandCount);

  const handleSelectColor = (colorKey: ColorKey) => {
    playClick();
    triggerHaptic();

    setBands((prev) => {
      const next = [...prev];
      next[activeBandIdx] = colorKey;
      return next;
    });

    // Auto-advance to next band column for seamless mobile flow
    if (activeBandIdx < bandCount - 1) {
      setActiveBandIdx((prev) => prev + 1);
    }
  };

  const handleApplyPreset = (presetBands: ColorKey[], count: BandCount) => {
    playClick();
    triggerHaptic();
    setBandCount(count);
    setBands(presetBands);
    setActiveBandIdx(0);
  };

  const handleCopy = () => {
    playClick();
    triggerHaptic();
    const text = `Resistor: ${result.formattedResistance} ±${result.tolerancePercent}% (${result.minResistance.toFixed(1)}Ω - ${result.maxResistance.toFixed(1)}Ω) [${bandCount}-Band: ${bands.slice(0, bandCount).join(', ')}]`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCalculation = () => {
    playClick();
    triggerHaptic();

    const calc: ResistorCalculation = {
      id: Date.now().toString(),
      type: 'rcc',
      title: `${bandCount}-Band ${result.formattedResistance}`,
      resistanceOhms: result.resistanceOhms,
      formattedResistance: result.formattedResistance,
      tolerance: result.tolerancePercent,
      minResistance: result.minResistance,
      maxResistance: result.maxResistance,
      bands: bands.slice(0, bandCount),
      tcr: result.tcr,
      eSeriesMatch: result.eSeriesMatch,
      timestamp: Date.now(),
    };

    onSave(calc);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  // Determine which list of colors applies to current active band
  const getAvailableColors = (): ColorKey[] => {
    if (activeBandIdx < digitCount) return DIGIT_COLOR_KEYS;
    if (activeBandIdx === digitCount) return MULTIPLIER_COLOR_KEYS;
    if (activeBandIdx === digitCount + 1) return TOLERANCE_COLOR_KEYS;
    return TCR_COLOR_KEYS;
  };

  const getColorLabel = (key: ColorKey): string => {
    const c = RCC_COLORS[key];
    if (activeBandIdx < digitCount) return `${c.digit ?? ''}`;
    if (activeBandIdx === digitCount) return c.multiplierLabel;
    if (activeBandIdx === digitCount + 1)
      return key === 'none' ? '±20%' : `±${c.tolerance}%`;
    return `${c.tcr} ppm`;
  };

  const getBandTitle = (idx: number): string => {
    if (idx < digitCount) return `${idx + 1}st Digit`;
    if (idx === digitCount) return 'Multiplier';
    if (idx === digitCount + 1) return 'Tolerance';
    return 'TCR (ppm/K)';
  };

  return (
    <div className="space-y-4 pb-20 max-w-xl mx-auto px-4 pt-2">
      {/* Band Count Segment Selector */}
      <div className="flex items-center justify-between bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-sm">
        {([3, 4, 5, 6] as BandCount[]).map((count) => {
          const isActive = bandCount === count;
          return (
            <button
              key={count}
              onClick={() => {
                playClick();
                triggerHaptic();
                setBandCount(count);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {count} Bands
            </button>
          );
        })}
      </div>

      {/* Resistor Visual graphic */}
      <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 shadow-xl">
        <ResistorSvg
          bands={bands}
          bandCount={bandCount}
          activeBandIndex={activeBandIdx}
          onSelectBandIndex={(idx) => {
            playClick();
            triggerHaptic();
            setActiveBandIdx(idx);
          }}
        />

        {/* Value Readout Box */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col items-center">
          <div className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span>{result.formattedResistance}</span>
            <span className="text-orange-400 font-bold text-lg">
              ±{result.tolerancePercent}%
            </span>
          </div>

          <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span>
              Range: <strong className="text-slate-200">{result.minResistance.toFixed(1)} Ω</strong> –{' '}
              <strong className="text-slate-200">{result.maxResistance.toFixed(1)} Ω</strong>
            </span>
            {result.tcr && (
              <span className="text-purple-400 font-semibold">
                TCR: {result.tcr} ppm/K
              </span>
            )}
            <span className="text-amber-400/90">
              E24 Match: <strong>{result.eSeriesMatch}</strong>
            </span>
          </div>

          {/* Save & Copy Action Buttons */}
          <div className="flex items-center gap-2 mt-3 w-full max-w-sm">
            <button
              onClick={handleSaveCalculation}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                justSaved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20'
              }`}
            >
              {justSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{justSaved ? 'Saved to Favorites' : 'Save Favorite'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Band Selector Bar (Band Tabs) */}
      <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select {getBandTitle(activeBandIdx)}:
          </span>
          <span className="text-xs font-extrabold text-orange-400">
            {RCC_COLORS[bands[activeBandIdx] || 'black']?.name}
          </span>
        </div>

        {/* Color Button Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {getAvailableColors().map((key) => {
            const colorDef = RCC_COLORS[key];
            const isSelected = bands[activeBandIdx] === key;

            return (
              <button
                key={key}
                onClick={() => handleSelectColor(key)}
                style={{ backgroundColor: colorDef.hex, color: colorDef.textColor }}
                className={`flex flex-col items-center justify-between p-2.5 rounded-xl border font-bold text-xs transition-all transform active:scale-95 ${
                  isSelected
                    ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-slate-900 shadow-lg scale-[1.02]'
                    : 'opacity-90 hover:opacity-100 border-black/20'
                }`}
              >
                <span className="capitalize text-xs font-extrabold">{colorDef.name}</span>
                <span className="text-[11px] opacity-90 font-mono mt-0.5">
                  {getColorLabel(key)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Common Resistor Presets */}
      <div className="bg-slate-900/60 rounded-2xl p-3 border border-slate-800/80">
        <div className="flex items-center space-x-1.5 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span>Quick Preset Resistors</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: '220 Ω', bands: ['red', 'red', 'brown', 'gold'], count: 4 },
            { label: '330 Ω', bands: ['orange', 'orange', 'brown', 'gold'], count: 4 },
            { label: '1 kΩ', bands: ['brown', 'black', 'red', 'gold'], count: 4 },
            { label: '4.7 kΩ', bands: ['yellow', 'violet', 'red', 'gold'], count: 4 },
            { label: '10 kΩ', bands: ['brown', 'black', 'orange', 'gold'], count: 4 },
            { label: '100 kΩ', bands: ['brown', 'black', 'yellow', 'gold'], count: 4 },
            { label: '1 MΩ', bands: ['brown', 'black', 'green', 'gold'], count: 4 },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => handleApplyPreset(item.bands as ColorKey[], item.count as BandCount)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-300 text-xs font-semibold"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

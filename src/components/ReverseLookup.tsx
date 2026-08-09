import React, { useState } from 'react';
import { BandCount, ColorKey, ResistorCalculation } from '../types';
import { findClosestE24, reverseRcc, reverseSmd } from '../utils/resistorCalc';
import { ResistorSvg } from './ResistorSvg';
import { SmdChipSvg } from './SmdChipSvg';
import { ArrowRight, Bookmark, Check, Sparkles } from 'lucide-react';

interface ReverseLookupProps {
  onSave: (calc: ResistorCalculation) => void;
  playClick: () => void;
  triggerHaptic: () => void;
}

export const ReverseLookup: React.FC<ReverseLookupProps> = ({
  onSave,
  playClick,
  triggerHaptic,
}) => {
  const [inputValue, setInputValue] = useState<string>('4.7k');
  const [targetOhms, setTargetOhms] = useState<number>(4700);
  const [bandCount, setBandCount] = useState<BandCount>(4);
  const [targetTolerance, setTargetTolerance] = useState<number>(5);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  // Parse input string like "4.7k", "100", "2.2M" into raw Ohms number
  const parseInputValue = (valStr: string): number => {
    const clean = valStr.trim().toLowerCase().replace(/,/g, '.');
    if (!clean) return 0;

    let multiplier = 1;
    if (clean.endsWith('k') || clean.endsWith('kω')) multiplier = 1000;
    else if (clean.endsWith('m') || clean.endsWith('mω')) multiplier = 1000000;
    else if (clean.endsWith('g') || clean.endsWith('gω')) multiplier = 1000000000;

    const numPart = clean.replace(/[^\d.]/g, '');
    const num = parseFloat(numPart);
    return isNaN(num) ? 0 : num * multiplier;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    const parsed = parseInputValue(val);
    setTargetOhms(parsed);
  };

  const closestE24 = findClosestE24(targetOhms);
  const rccReversed = reverseRcc(targetOhms, bandCount, targetTolerance);
  const smdReversed = reverseSmd(targetOhms);

  const handleApplyE24 = () => {
    playClick();
    triggerHaptic();
    setInputValue(closestE24.formatted);
    setTargetOhms(closestE24.value);
  };

  const handleSave = () => {
    playClick();
    triggerHaptic();

    const calc: ResistorCalculation = {
      id: Date.now().toString(),
      type: 'reverse',
      title: `Generated ${rccReversed.result.formattedResistance}`,
      resistanceOhms: rccReversed.result.resistanceOhms,
      formattedResistance: rccReversed.result.formattedResistance,
      tolerance: rccReversed.result.tolerancePercent,
      minResistance: rccReversed.result.minResistance,
      maxResistance: rccReversed.result.maxResistance,
      bands: rccReversed.bands,
      smdCode: smdReversed.code3,
      eSeriesMatch: closestE24.formatted,
      timestamp: Date.now(),
    };

    onSave(calc);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="space-y-4 pb-20 max-w-xl mx-auto px-4 pt-2">
      {/* Search Input Box */}
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3 shadow-lg">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Enter Target Resistance (e.g., 4.7k, 330, 2.2M):
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="e.g., 4.7k or 220"
            className="flex-1 bg-slate-800 border border-slate-700 text-white font-mono font-bold text-lg rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-500 shadow-inner"
          />
          <button
            onClick={handleSave}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              justSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20'
            }`}
          >
            {justSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            <span className="hidden sm:inline">{justSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        {/* E24 Recommendation Pill */}
        <div className="flex items-center justify-between text-xs bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Nearest E24 Commercial Resistor:</span>
            <strong className="text-orange-400 font-extrabold">{closestE24.formatted}</strong>
          </div>
          {closestE24.value !== targetOhms && (
            <button
              onClick={handleApplyE24}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-0.5"
            >
              <span>Use E24</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Generated Through-Hole Resistor Bands */}
      <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Generated Color Code ({bandCount}-Band)
          </h3>
          <div className="flex gap-1 text-[11px] font-bold">
            {([4, 5] as BandCount[]).map((c) => (
              <button
                key={c}
                onClick={() => {
                  playClick();
                  triggerHaptic();
                  setBandCount(c);
                }}
                className={`px-2 py-0.5 rounded-lg border ${
                  bandCount === c
                    ? 'bg-orange-500 text-white border-orange-400'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {c}-Band
              </button>
            ))}
          </div>
        </div>

        <ResistorSvg bands={rccReversed.bands} bandCount={bandCount} />

        <div className="text-center font-bold text-sm text-slate-200">
          Color Sequence:{' '}
          <span className="text-orange-400 capitalize">
            {rccReversed.bands.slice(0, bandCount).join(' • ')}
          </span>
        </div>
      </div>

      {/* Generated SMD Codes */}
      <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-3 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Generated SMD Resistor Codes
        </h3>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-center flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">3-Digit (±5%)</span>
            <span className="text-lg font-mono font-black text-orange-400 my-1">
              {smdReversed.code3}
            </span>
            <SmdChipSvg codeStr={smdReversed.code3} formattedResistance="" className="scale-75 -my-4" />
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-center flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">4-Digit (±1%)</span>
            <span className="text-lg font-mono font-black text-amber-400 my-1">
              {smdReversed.code4}
            </span>
            <SmdChipSvg codeStr={smdReversed.code4} formattedResistance="" className="scale-75 -my-4" />
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-center flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">EIA-96 (±1%)</span>
            <span className="text-lg font-mono font-black text-emerald-400 my-1">
              {smdReversed.codeEia96}
            </span>
            <SmdChipSvg codeStr={smdReversed.codeEia96} formattedResistance="" className="scale-75 -my-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

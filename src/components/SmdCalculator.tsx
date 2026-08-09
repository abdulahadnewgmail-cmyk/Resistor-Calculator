import React, { useState } from 'react';
import { ResistorCalculation, SmdMode } from '../types';
import { calculateSmd } from '../utils/resistorCalc';
import { SmdChipSvg } from './SmdChipSvg';
import { EIA96_CODES, EIA96_MULTIPLIERS } from '../constants/resistorData';
import { Bookmark, Copy, Check, Table } from 'lucide-react';

interface SmdCalculatorProps {
  onSave: (calc: ResistorCalculation) => void;
  playClick: () => void;
  triggerHaptic: () => void;
}

export const SmdCalculator: React.FC<SmdCalculatorProps> = ({
  onSave,
  playClick,
  triggerHaptic,
}) => {
  const [smdMode, setSmdMode] = useState<SmdMode>('3digit');
  const [digits, setDigits] = useState<string[]>(['4', '7', '3']);
  const [showMatrix, setShowMatrix] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  const codeStr = digits.join('');
  const result = calculateSmd(codeStr, smdMode);

  const handleModeChange = (mode: SmdMode) => {
    playClick();
    triggerHaptic();
    setSmdMode(mode);
    if (mode === '3digit') setDigits(['4', '7', '3']);
    else if (mode === '4digit') setDigits(['1', '0', '0', '1']);
    else if (mode === 'eia96') setDigits(['0', '1', 'A']);
    else setDigits(['0', '0', '0']);
  };

  const handleSetDigit = (idx: number, val: string) => {
    playClick();
    triggerHaptic();
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleSave = () => {
    playClick();
    triggerHaptic();

    const calc: ResistorCalculation = {
      id: Date.now().toString(),
      type: 'smd',
      title: `SMD ${codeStr} (${result.formatted})`,
      resistanceOhms: result.ohms,
      formattedResistance: result.formatted,
      tolerance: smdMode === '3digit' ? 5 : 1,
      minResistance: result.ohms * (smdMode === '3digit' ? 0.95 : 0.99),
      maxResistance: result.ohms * (smdMode === '3digit' ? 1.05 : 1.01),
      smdCode: codeStr,
      timestamp: Date.now(),
    };

    onSave(calc);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleCopy = () => {
    playClick();
    triggerHaptic();
    const text = `SMD Resistor Code ${codeStr}: ${result.formatted} (${result.toleranceStr})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const digitOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'R'];
  const eia96Letters = ['Z', 'Y', 'R', 'X', 'S', 'A', 'B', 'H', 'C', 'D', 'E', 'F'];

  return (
    <div className="space-y-4 pb-20 max-w-xl mx-auto px-4 pt-2">
      {/* Mode Selector */}
      <div className="flex items-center justify-between bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-sm text-xs font-bold">
        {[
          { id: '3digit', label: '3-Digit (±5%)' },
          { id: '4digit', label: '4-Digit (±1%)' },
          { id: 'eia96', label: 'EIA-96 (±1%)' },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => handleModeChange(m.id as SmdMode)}
            className={`flex-1 py-2 rounded-xl transition-all ${
              smdMode === m.id
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Chip Visualizer & Value Readout */}
      <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 shadow-xl flex flex-col items-center">
        <SmdChipSvg codeStr={codeStr} formattedResistance={result.formatted} />

        <div className="mt-3 text-xs text-slate-400 font-medium">
          Tolerance: <strong className="text-orange-400">{result.toleranceStr}</strong>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-4 w-full max-w-sm">
          <button
            onClick={handleSave}
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

      {/* Digit Selectors */}
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Enter SMD Code Characters:
        </h3>

        {smdMode === '3digit' && (
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((colIdx) => (
              <div key={colIdx} className="flex flex-col space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 text-center">
                  {colIdx === 2 ? 'Multiplier' : `${colIdx + 1}st Digit`}
                </span>
                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
                  {digitOptions.map((d) => (
                    <button
                      key={d}
                      onClick={() => handleSetDigit(colIdx, d)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        digits[colIdx] === d
                          ? 'bg-orange-500 text-white ring-1 ring-orange-400 shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {smdMode === '4digit' && (
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((colIdx) => (
              <div key={colIdx} className="flex flex-col space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 text-center">
                  {colIdx === 3 ? 'Mult' : `${colIdx + 1}st`}
                </span>
                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
                  {digitOptions.map((d) => (
                    <button
                      key={d}
                      onClick={() => handleSetDigit(colIdx, d)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        digits[colIdx] === d
                          ? 'bg-orange-500 text-white ring-1 ring-orange-400 shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {smdMode === 'eia96' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* EIA-96 Code Input field */}
              <div className="flex flex-col space-y-1">
                <span className="text-[11px] font-bold text-slate-400">
                  2-Digit Value Code (01-96)
                </span>
                <input
                  type="text"
                  maxLength={2}
                  value={`${digits[0] || ''}${digits[1] || ''}`}
                  onChange={(e) => {
                    const val = e.target.value.padStart(2, '0');
                    setDigits([val[0] || '0', val[1] || '1', digits[2] || 'A']);
                  }}
                  className="bg-slate-800 border border-slate-700 text-white rounded-xl py-2 px-3 font-mono font-bold text-center text-lg focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* EIA-96 Multiplier letter select */}
              <div className="flex flex-col space-y-1">
                <span className="text-[11px] font-bold text-slate-400">
                  Multiplier Letter
                </span>
                <select
                  value={digits[2] || 'A'}
                  onChange={(e) => handleSetDigit(2, e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-xl py-2 px-3 font-mono font-bold text-center text-base focus:outline-none focus:border-orange-500"
                >
                  {eia96Letters.map((lettr) => (
                    <option key={lettr} value={lettr}>
                      {lettr} (×{EIA96_MULTIPLIERS[lettr]})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                playClick();
                triggerHaptic();
                setShowMatrix(!showMatrix);
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-orange-400 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Table className="w-3.5 h-3.5" />
              <span>{showMatrix ? 'Hide EIA-96 Code Matrix' : 'View EIA-96 Full Code Matrix'}</span>
            </button>
          </div>
        )}
      </div>

      {/* EIA-96 Full Matrix Inspection Table */}
      {smdMode === 'eia96' && showMatrix && (
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-300">EIA-96 Code Lookup Matrix (1%)</h4>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-60 overflow-y-auto text-xs font-mono">
            {Object.entries(EIA96_CODES).map(([code, val]) => (
              <div
                key={code}
                className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/60 text-center"
              >
                <span className="text-orange-400 font-bold">{code}</span> = {val}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

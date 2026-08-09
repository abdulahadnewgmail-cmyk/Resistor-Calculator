import React, { useState } from 'react';
import { formatResistance } from '../utils/resistorCalc';
import { Zap, Lightbulb, GitMerge } from 'lucide-react';

interface OhmAndToolsProps {
  playClick: () => void;
  triggerHaptic: () => void;
}

export const OhmAndTools: React.FC<OhmAndToolsProps> = ({ playClick, triggerHaptic }) => {
  const [activeTool, setActiveTool] = useState<'ohm' | 'led' | 'combo'>('ohm');

  // --- Ohm's Law State ---
  const [voltage, setVoltage] = useState<string>('5');
  const [currentMa, setCurrentMa] = useState<string>('20');
  const [resistance, setResistance] = useState<string>('250');

  // Compute Ohm's Law
  const v = parseFloat(voltage) || 0;
  const iAmps = (parseFloat(currentMa) || 0) / 1000;
  const rOhms = parseFloat(resistance) || 0;

  const calculatedPowerMw = v * iAmps * 1000;
  const calculatedPowerW = v * iAmps;

  // --- LED Calculator State ---
  const [vSupply, setVSupply] = useState<string>('5');
  const [vForward, setVForward] = useState<string>('2'); // Red LED ~2V
  const [iLedMa, setILedMa] = useState<string>('20');

  const vSup = parseFloat(vSupply) || 0;
  const vFwd = parseFloat(vForward) || 0;
  const iLed = (parseFloat(iLedMa) || 0) / 1000;

  const ledResistorVal = iLed > 0 ? Math.max(0, (vSup - vFwd) / iLed) : 0;
  const ledPowerWatts = Math.pow(iLed, 2) * ledResistorVal;

  // --- Series/Parallel State ---
  const [r1, setR1] = useState<string>('1000');
  const [r2, setR2] = useState<string>('1000');

  const numR1 = parseFloat(r1) || 0;
  const numR2 = parseFloat(r2) || 0;

  const seriesTotal = numR1 + numR2;
  const parallelTotal =
    numR1 > 0 && numR2 > 0 ? (numR1 * numR2) / (numR1 + numR2) : 0;

  return (
    <div className="space-y-4 pb-20 max-w-xl mx-auto px-4 pt-2">
      {/* Tool Navigation */}
      <div className="flex items-center justify-between bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-sm text-xs font-bold">
        {[
          { id: 'ohm', label: "Ohm's Law", icon: <Zap className="w-3.5 h-3.5" /> },
          { id: 'led', label: 'LED Resistor', icon: <Lightbulb className="w-3.5 h-3.5" /> },
          { id: 'combo', label: 'Series/Parallel', icon: <GitMerge className="w-3.5 h-3.5" /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              playClick();
              triggerHaptic();
              setActiveTool(t.id as any);
            }}
            className={`flex-1 py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTool === t.id
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TOOL 1: OHM'S LAW */}
      {activeTool === 'ohm' && (
        <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-orange-400 font-extrabold text-sm">
            <Zap className="w-4 h-4" />
            <span>Ohm's Law & Power Calculator</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Voltage (V)</label>
              <input
                type="number"
                value={voltage}
                onChange={(e) => setVoltage(e.target.value)}
                className="bg-slate-800 border border-slate-700 font-mono font-bold text-white rounded-xl py-2 px-3 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Current (mA)</label>
              <input
                type="number"
                value={currentMa}
                onChange={(e) => setCurrentMa(e.target.value)}
                className="bg-slate-800 border border-slate-700 font-mono font-bold text-white rounded-xl py-2 px-3 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Resistance (Ω)</label>
              <input
                type="number"
                value={resistance}
                onChange={(e) => setResistance(e.target.value)}
                className="bg-slate-800 border border-slate-700 font-mono font-bold text-white rounded-xl py-2 px-3 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Results readout */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Power (Watts)</span>
              <span className="text-xl font-black text-amber-400">
                {calculatedPowerW < 1
                  ? `${calculatedPowerMw.toFixed(1)} mW`
                  : `${calculatedPowerW.toFixed(2)} W`}
              </span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Standard Rating</span>
              <span className="text-xl font-black text-emerald-400">
                {calculatedPowerW <= 0.125
                  ? '1/8 Watt'
                  : calculatedPowerW <= 0.25
                  ? '1/4 Watt'
                  : calculatedPowerW <= 0.5
                  ? '1/2 Watt'
                  : calculatedPowerW <= 1
                  ? '1 Watt'
                  : '> 2 Watts'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 2: LED SERIES RESISTOR */}
      {activeTool === 'led' && (
        <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-sm">
            <Lightbulb className="w-4 h-4" />
            <span>LED Series Current Limiter Calculator</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Supply Voltage V<sub>s</sub> (V)</label>
              <input
                type="number"
                value={vSupply}
                onChange={(e) => setVSupply(e.target.value)}
                className="bg-slate-800 border border-slate-700 font-mono font-bold text-white rounded-xl py-2 px-3 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[11px] font-bold text-slate-400">LED Forward V<sub>f</sub> (V)</label>
              <input
                type="number"
                step="0.1"
                value={vForward}
                onChange={(e) => setVForward(e.target.value)}
                className="bg-slate-800 border border-slate-700 font-mono font-bold text-white rounded-xl py-2 px-3 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[11px] font-bold text-slate-400">LED Current I<sub>f</sub> (mA)</label>
              <input
                type="number"
                value={iLedMa}
                onChange={(e) => setILedMa(e.target.value)}
                className="bg-slate-800 border border-slate-700 font-mono font-bold text-white rounded-xl py-2 px-3 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 text-center space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Required Resistor Value
            </span>
            <div className="text-3xl font-black text-orange-400">
              {formatResistance(ledResistorVal)}
            </div>
            <div className="text-xs text-slate-300">
              Dissipated Power: <strong>{(ledPowerWatts * 1000).toFixed(1)} mW</strong> • Recommended Rating:{' '}
              <strong className="text-amber-400">
                {ledPowerWatts <= 0.125 ? '1/4 Watt (0.25W)' : '1/2 Watt (0.5W)'}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 3: SERIES / PARALLEL COMBINER */}
      {activeTool === 'combo' && (
        <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-sm">
            <GitMerge className="w-4 h-4" />
            <span>Series & Parallel Resistor Combiner</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Resistor R<sub>1</sub> (Ω)</label>
              <input
                type="number"
                value={r1}
                onChange={(e) => setR1(e.target.value)}
                className="bg-slate-800 border border-slate-700 font-mono font-bold text-white rounded-xl py-2 px-3 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Resistor R<sub>2</sub> (Ω)</label>
              <input
                type="number"
                value={r2}
                onChange={(e) => setR2(e.target.value)}
                className="bg-slate-800 border border-slate-700 font-mono font-bold text-white rounded-xl py-2 px-3 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">In Series (R1 + R2)</span>
              <span className="text-xl font-black text-amber-400">
                {formatResistance(seriesTotal)}
              </span>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">In Parallel (R1 ∥ R2)</span>
              <span className="text-xl font-black text-emerald-400">
                {formatResistance(parallelTotal)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

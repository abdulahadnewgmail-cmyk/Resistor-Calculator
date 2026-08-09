import React, { useState } from 'react';
import { ResistorCalculation } from '../types';
import { RCC_COLORS } from '../constants/resistorData';
import { Bookmark, Trash2, Download, Search, Info, Table } from 'lucide-react';

interface SavedLogProps {
  savedItems: ResistorCalculation[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  playClick: () => void;
  triggerHaptic: () => void;
}

export const SavedLog: React.FC<SavedLogProps> = ({
  savedItems,
  onRemoveItem,
  onClearAll,
  playClick,
  triggerHaptic,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'favorites' | 'chart'>('favorites');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredItems = savedItems.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.formattedResistance.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportTxt = () => {
    playClick();
    triggerHaptic();
    const text = savedItems
      .map(
        (it) =>
          `• ${it.title}: ${it.formattedResistance} (Tol: ±${it.tolerance}%, Range: ${it.minResistance.toFixed(
            1
          )}Ω - ${it.maxResistance.toFixed(1)}Ω)`
      )
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resistors-list-${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="space-y-4 pb-20 max-w-xl mx-auto px-4 pt-2">
      {/* Sub Tabs: Favorites vs Color Chart */}
      <div className="flex items-center justify-between bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold shadow-sm">
        <button
          onClick={() => {
            playClick();
            triggerHaptic();
            setActiveSubTab('favorites');
          }}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'favorites'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved Favorites ({savedItems.length})</span>
        </button>

        <button
          onClick={() => {
            playClick();
            triggerHaptic();
            setActiveSubTab('chart');
          }}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'chart'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Color Chart Reference</span>
        </button>
      </div>

      {activeSubTab === 'favorites' && (
        <div className="space-y-3">
          {/* Search & Export Actions */}
          {savedItems.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search saved resistors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                onClick={handleExportTxt}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1"
                title="Export as Text File"
              >
                <Download className="w-4 h-4 text-orange-400" />
              </button>

              <button
                onClick={() => {
                  playClick();
                  triggerHaptic();
                  onClearAll();
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-red-900/50 text-red-400 border border-slate-700 text-xs font-bold"
                title="Clear All Saved"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* List of Saved Items */}
          {filteredItems.length === 0 ? (
            <div className="bg-slate-900/80 rounded-2xl p-8 border border-slate-800 text-center space-y-2">
              <Info className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">No Saved Resistors</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Save calculations from the RCC or SMD tabs to build your personal electronics list!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-800 flex items-center justify-between shadow-md"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-white">{item.title}</h4>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>Tolerance: ±{item.tolerance}%</span>
                      <span>•</span>
                      <span className="font-mono text-orange-400">
                        {item.minResistance.toFixed(1)}Ω - {item.maxResistance.toFixed(1)}Ω
                      </span>
                    </div>

                    {item.bands && item.bands.length > 0 && (
                      <div className="flex items-center gap-1 pt-1">
                        {item.bands.map((bKey, idx) => (
                          <div
                            key={idx}
                            className="w-3.5 h-3.5 rounded-full border border-slate-700"
                            style={{ backgroundColor: RCC_COLORS[bKey]?.hex }}
                            title={RCC_COLORS[bKey]?.name}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      playClick();
                      triggerHaptic();
                      onRemoveItem(item.id);
                    }}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Color Code Chart Reference Matrix */}
      {activeSubTab === 'chart' && (
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3 shadow-xl overflow-x-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Resistor Color Code Standard Chart
          </h3>

          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="py-2 px-1">Color</th>
                <th className="py-2 px-1 text-center">Digit</th>
                <th className="py-2 px-1 text-center">Mult</th>
                <th className="py-2 px-1 text-center">Tol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {Object.entries(RCC_COLORS).map(([k, c]) => (
                <tr key={k} className="hover:bg-slate-800/40">
                  <td className="py-2 px-1 flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full border border-slate-700 shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="capitalize font-bold text-slate-200">{c.name}</span>
                  </td>
                  <td className="py-2 px-1 text-center text-slate-300">
                    {c.digit !== null ? c.digit : '—'}
                  </td>
                  <td className="py-2 px-1 text-center text-orange-400 font-bold">
                    {c.multiplierLabel}
                  </td>
                  <td className="py-2 px-1 text-center text-amber-400 font-bold">
                    {c.tolerance !== null ? `±${c.tolerance}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

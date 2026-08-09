import React from 'react';
import { Palette, Microchip, RotateCcw, Wrench, Camera, Bookmark } from 'lucide-react';

export type NavTab = 'rcc' | 'smd' | 'reverse' | 'tools' | 'scanner' | 'saved';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  savedCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  savedCount = 0,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'rcc', label: 'RCC', icon: <Palette className="w-5 h-5" /> },
    { id: 'smd', label: 'SMD', icon: <Microchip className="w-5 h-5" /> },
    { id: 'reverse', label: 'Lookup', icon: <RotateCcw className="w-5 h-5" /> },
    { id: 'tools', label: 'Ohm Tools', icon: <Wrench className="w-5 h-5" /> },
    { id: 'scanner', label: 'AI Scan', icon: <Camera className="w-5 h-5" /> },
    { id: 'saved', label: 'Saved', icon: <Bookmark className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/98 backdrop-blur-lg border-t border-slate-800/90 px-1 py-1.5 pb-safe">
      <div className="max-w-xl mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-orange-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active Tab Pill Indicator */}
              {isActive && (
                <div className="absolute inset-0 bg-orange-500/15 rounded-xl border border-orange-500/30 -z-10 animate-fade-in" />
              )}
              <div className="relative">
                {tab.icon}
                {tab.id === 'saved' && savedCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-orange-500 text-white font-extrabold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {savedCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

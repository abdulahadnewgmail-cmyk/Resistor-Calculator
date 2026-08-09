import React from 'react';
import { Volume2, VolumeX, Smartphone, Bookmark, Cpu } from 'lucide-react';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  hapticEnabled: boolean;
  onToggleHaptic: () => void;
  savedCount: number;
  onOpenSaved: () => void;
  onOpenApkGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  hapticEnabled,
  onToggleHaptic,
  savedCount,
  onOpenSaved,
  onOpenApkGuide,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 text-slate-100 shadow-lg">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        {/* App Title & Icon */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 ring-1 ring-orange-400/30">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Resistor Calc
            </h1>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-orange-400/90 block">
              Android Edition • RCC & SMD
            </span>
          </div>
        </div>

        {/* Header Quick Controls */}
        <div className="flex items-center space-x-1.5">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Disable Audio Clicks' : 'Enable Audio Clicks'}
            className={`p-2 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-slate-800 border-orange-500/40 text-orange-400 shadow-xs'
                : 'bg-slate-800/50 border-slate-700/60 text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Android Haptic Feedback Indicator */}
          <button
            onClick={onToggleHaptic}
            title={hapticEnabled ? 'Haptic Vibration Enabled' : 'Haptic Vibration Disabled'}
            className={`p-2 rounded-xl border transition-all text-xs font-bold ${
              hapticEnabled
                ? 'bg-slate-800 border-amber-500/40 text-amber-400'
                : 'bg-slate-800/50 border-slate-700/60 text-slate-500'
            }`}
          >
            VIB
          </button>

          {/* Saved Favorites Shortcut Badge */}
          <button
            onClick={onOpenSaved}
            className="relative p-2 rounded-xl bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-orange-400 transition-all"
          >
            <Bookmark className="w-4 h-4" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {savedCount}
              </span>
            )}
          </button>

          {/* APK / PWA Guide */}
          <button
            onClick={onOpenApkGuide}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-600/20 active:scale-95 transition-transform"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">APK</span>
          </button>
        </div>
      </div>
    </header>
  );
};

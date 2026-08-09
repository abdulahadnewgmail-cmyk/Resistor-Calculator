import React, { useState, useEffect } from 'react';
import { NavTab, BottomNav } from './components/BottomNav';
import { Header } from './components/Header';
import { RccCalculator } from './components/RccCalculator';
import { SmdCalculator } from './components/SmdCalculator';
import { ReverseLookup } from './components/ReverseLookup';
import { OhmAndTools } from './components/OhmAndTools';
import { AiScanner } from './components/AiScanner';
import { SavedLog } from './components/SavedLog';
import { ApkGuideModal } from './components/ApkGuideModal';
import { BandCount, ColorKey, ResistorCalculation } from './types';
import { playClickSound, triggerHapticFeedback } from './utils/audioHaptics';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('rcc');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(true);
  const [savedItems, setSavedItems] = useState<ResistorCalculation[]>([]);
  const [isApkGuideOpen, setIsApkGuideOpen] = useState<boolean>(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedSound = localStorage.getItem('rcc_sound');
      if (savedSound !== null) setSoundEnabled(savedSound === 'true');

      const savedHaptic = localStorage.getItem('rcc_haptic');
      if (savedHaptic !== null) setHapticEnabled(savedHaptic === 'true');

      const savedList = localStorage.getItem('rcc_favorites');
      if (savedList) setSavedItems(JSON.parse(savedList));
    } catch (e) {
      console.error('Failed to load settings from localStorage:', e);
    }
  }, []);

  // Save favorites to localStorage
  const handleSaveCalculation = (calc: ResistorCalculation) => {
    setSavedItems((prev) => {
      const next = [calc, ...prev.filter((item) => item.id !== calc.id)];
      try {
        localStorage.setItem('rcc_favorites', JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  const handleRemoveSaved = (id: string) => {
    setSavedItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('rcc_favorites', JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  const handleClearAllSaved = () => {
    setSavedItems([]);
    try {
      localStorage.removeItem('rcc_favorites');
    } catch (e) {
      // ignore
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('rcc_sound', String(next));
  };

  const toggleHaptic = () => {
    const next = !hapticEnabled;
    setHapticEnabled(next);
    localStorage.setItem('rcc_haptic', String(next));
  };

  const playClick = () => playClickSound(soundEnabled);
  const triggerHaptic = () => triggerHapticFeedback(hapticEnabled);

  const handleTabChange = (tab: NavTab) => {
    playClick();
    triggerHaptic();
    setActiveTab(tab);
  };

  // State bridge for AI Scanner to apply detected bands to RCC tab
  const handleApplyScanToRcc = (bands: ColorKey[], _count: BandCount) => {
    playClick();
    triggerHaptic();
    setActiveTab('rcc');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white pb-safe">
      {/* Top Android Header */}
      <Header
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        hapticEnabled={hapticEnabled}
        onToggleHaptic={toggleHaptic}
        savedCount={savedItems.length}
        onOpenSaved={() => handleTabChange('saved')}
        onOpenApkGuide={() => {
          playClick();
          triggerHaptic();
          setIsApkGuideOpen(true);
        }}
      />

      {/* Main Tab Content View */}
      <main className="flex-1 py-3">
        {activeTab === 'rcc' && (
          <RccCalculator
            onSave={handleSaveCalculation}
            playClick={playClick}
            triggerHaptic={triggerHaptic}
          />
        )}

        {activeTab === 'smd' && (
          <SmdCalculator
            onSave={handleSaveCalculation}
            playClick={playClick}
            triggerHaptic={triggerHaptic}
          />
        )}

        {activeTab === 'reverse' && (
          <ReverseLookup
            onSave={handleSaveCalculation}
            playClick={playClick}
            triggerHaptic={triggerHaptic}
          />
        )}

        {activeTab === 'tools' && (
          <OhmAndTools
            playClick={playClick}
            triggerHaptic={triggerHaptic}
          />
        )}

        {activeTab === 'scanner' && (
          <AiScanner
            onApplyScanToRcc={handleApplyScanToRcc}
            playClick={playClick}
            triggerHaptic={triggerHaptic}
          />
        )}

        {activeTab === 'saved' && (
          <SavedLog
            savedItems={savedItems}
            onRemoveItem={handleRemoveSaved}
            onClearAll={handleClearAllSaved}
            playClick={playClick}
            triggerHaptic={triggerHaptic}
          />
        )}
      </main>

      {/* Android Material 3 Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        savedCount={savedItems.length}
      />

      {/* Android Installation / APK packaging info modal */}
      <ApkGuideModal
        isOpen={isApkGuideOpen}
        onClose={() => {
          playClick();
          triggerHaptic();
          setIsApkGuideOpen(false);
        }}
      />
    </div>
  );
}

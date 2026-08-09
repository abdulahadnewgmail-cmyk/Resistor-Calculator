import React from 'react';
import { Smartphone, Download, X, CheckCircle, Code, ShieldCheck } from 'lucide-react';

interface ApkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkGuideModal: React.FC<ApkGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-orange-400 font-extrabold">
            <Smartphone className="w-5 h-5" />
            <span className="text-base">Android Installation & APK Guide</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tablet Direct Install (No PC required!) */}
        <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/30 space-y-2">
          <div className="flex items-center space-x-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
            <CheckCircle className="w-4 h-4" />
            <span>Tablet Direct Install (No Computer Required!)</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            You can install this app directly on your tablet right now without an APK compiler:
          </p>
          <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 font-sans pl-1">
            <li>In Google Chrome / Edge on your tablet, tap the <strong>3 dots menu (⋮)</strong> at the top right.</li>
            <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.</li>
            <li>Tap <strong>Install</strong> when prompted.</li>
            <li>An app icon will be installed on your tablet home screen & app drawer. It launches full-screen without address bars and works completely offline!</li>
          </ol>
        </div>

        {/* Why PWABuilder gave 404 */}
        <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30 space-y-1.5">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Why PWABuilder Showed 404 on Preview URL</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            AI Studio development URLs (<code>*.run.app</code>) are private sandboxed containers protected by Google preview authentication. External web bots like PWABuilder get blocked by Google security headers, which is why PWABuilder gave a 404 error.
          </p>
        </div>

        {/* How to Get a Standalone .APK File on Tablet */}
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Download className="w-4 h-4" />
            <span>How to Get a Standalone .APK File on Tablet</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            If you need a physical <code>.apk</code> file installer directly on your tablet:
          </p>
          <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 font-sans pl-1">
            <li>Download the project source ZIP directly on your tablet from <strong>AI Studio Menu &gt; Export &gt; Download ZIP</strong>.</li>
            <li>Use a free web builder like <a href="https://www.webintoapp.com" target="_blank" rel="noreferrer" className="text-orange-400 underline font-bold">WebIntoApp.com</a> or <a href="https://www.appsgeyser.com" target="_blank" rel="noreferrer" className="text-orange-400 underline font-bold">AppsGeyser.com</a> on your tablet.</li>
            <li>Upload your HTML/ZIP files or app link to convert and download your <code>.apk</code> directly to your tablet storage!</li>
          </ol>
        </div>

        {/* Native Android APK with Capacitor */}
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Code className="w-4 h-4" />
            <span>Step 2: Generate Offline Native .APK (Android Studio)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            We have pre-configured <strong>Capacitor</strong> inside this project! Open terminal in the unzipped project folder and run:
          </p>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-orange-300 space-y-1 overflow-x-auto">
            <div>npm install</div>
            <div>npm run build</div>
            <div>npx cap add android</div>
            <div>npx cap open android</div>
          </div>
          <p className="text-[11px] text-slate-400">
            Android Studio will open automatically. In Android Studio, click <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> to generate your offline <code>.apk</code> file!
          </p>
        </div>

        {/* Built for Android Features */}
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 space-y-1">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-300">
            <ShieldCheck className="w-4 h-4 text-orange-400" />
            <span>Android Mobile Optimizations Included:</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            • Touch targets ≥ 44px • Android Haptic Vibration • Web Audio Synthesis • Dark OLED Theme • Offline Service Worker Cache
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20"
        >
          Got It!
        </button>
      </div>
    </div>
  );
};

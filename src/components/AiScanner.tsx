import React, { useState, useRef } from 'react';
import { AiScanResult, BandCount, ColorKey } from '../types';
import { Camera, Upload, Sparkles, AlertCircle, Check, ArrowRight } from 'lucide-react';

interface AiScannerProps {
  onApplyScanToRcc: (bands: ColorKey[], bandCount: BandCount) => void;
  playClick: () => void;
  triggerHaptic: () => void;
}

export const AiScanner: React.FC<AiScannerProps> = ({
  onApplyScanToRcc,
  playClick,
  triggerHaptic,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<AiScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playClick();
    triggerHaptic();
    setErrorMsg(null);
    setScanResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      
      // Downscale image using canvas to ensure fast payload transmission
      const img = new Image();
      img.onload = () => {
        const maxDim = 1024;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const resizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          setSelectedImage(resizedBase64);
          analyzeImage(resizedBase64, 'image/jpeg');
        } else {
          setSelectedImage(src);
          analyzeImage(src, file.type || 'image/jpeg');
        }
      };
      img.onerror = () => {
        setSelectedImage(src);
        analyzeImage(src, file.type || 'image/jpeg');
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (imageBase64: string, mimeType: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/analyze-resistor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to scan resistor.');
      }

      setScanResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred while analyzing image.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!scanResult || !scanResult.bands || scanResult.bands.length === 0) return;
    playClick();
    triggerHaptic();

    const count = (scanResult.bandCount || scanResult.bands.length) as BandCount;
    onApplyScanToRcc(scanResult.bands, count);
  };

  return (
    <div className="space-y-4 pb-20 max-w-xl mx-auto px-4 pt-2">
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 text-orange-400 font-extrabold text-sm">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>AI Camera Resistor Scanner</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Snap a photo or upload an image of a through-hole or SMD chip resistor. AI will auto-detect the color bands or code markings!
        </p>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Upload Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              playClick();
              triggerHaptic();
              fileInputRef.current?.click();
            }}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 active:scale-95 transition-transform"
          >
            <Camera className="w-4 h-4" />
            <span>Take Photo</span>
          </button>

          <button
            onClick={() => {
              playClick();
              triggerHaptic();
              fileInputRef.current?.click();
            }}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Upload className="w-4 h-4" />
            <span>Choose File</span>
          </button>
        </div>

        {/* Selected Image Preview & Scanning Overlay */}
        {selectedImage && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-700 max-h-64 flex items-center justify-center bg-black/40">
            <img
              src={selectedImage}
              alt="Resistor Upload"
              className="w-full h-auto max-h-60 object-contain"
              referrerPolicy="no-referrer"
            />

            {/* AI Scan Scanning Line Animation */}
            {loading && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-orange-400 animate-pulse">
                  Analyzing Resistor Color Bands...
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error alert */}
        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Scan Results Card */}
        {scanResult && !loading && (
          <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Scan Recognition Result
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  scanResult.confidence === 'high'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}
              >
                {scanResult.confidence || 'Medium'} Confidence
              </span>
            </div>

            <div className="text-center">
              <div className="text-2xl font-black text-orange-400">
                {scanResult.resistanceFormatted || 'Unknown Value'}
              </div>
              {scanResult.description && (
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {scanResult.description}
                </p>
              )}
            </div>

            {scanResult.bands && scanResult.bands.length > 0 && (
              <div className="pt-2">
                <button
                  onClick={handleApply}
                  className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply Detected Color Bands to Calculator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

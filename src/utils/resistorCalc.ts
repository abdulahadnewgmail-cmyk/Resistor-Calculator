import { BandCount, ColorKey, SmdMode } from '../types';
import {
  E24_BASE,
  EIA96_CODES,
  EIA96_MULTIPLIERS,
  RCC_COLORS,
} from '../constants/resistorData';

export function trimNumber(n: number, maxDecimals: number = 3): string {
  if (isNaN(n) || !isFinite(n)) return '0';
  const str = n.toFixed(maxDecimals);
  return parseFloat(str).toString();
}

export function formatResistance(ohms: number): string {
  if (isNaN(ohms) || !isFinite(ohms) || ohms < 0) return '0 Ω';
  if (ohms >= 1e9) return `${trimNumber(ohms / 1e9)} GΩ`;
  if (ohms >= 1e6) return `${trimNumber(ohms / 1e6)} MΩ`;
  if (ohms >= 1e3) return `${trimNumber(ohms / 1e3)} kΩ`;
  return `${trimNumber(ohms)} Ω`;
}

export interface RccResult {
  resistanceOhms: number;
  formattedResistance: string;
  tolerancePercent: number;
  minResistance: number;
  maxResistance: number;
  tcr: number | null;
  eSeriesMatch: string;
}

export function calculateRcc(bands: ColorKey[], bandCount: BandCount): RccResult {
  const digitCount = bandCount === 5 || bandCount === 6 ? 3 : 2;

  let digitVal = 0;
  for (let i = 0; i < digitCount; i++) {
    const colorKey = bands[i] || 'black';
    const digit = RCC_COLORS[colorKey].digit ?? 0;
    digitVal = digitVal * 10 + digit;
  }

  const multKey = bands[digitCount] || 'black';
  const multiplier = RCC_COLORS[multKey].multiplier ?? 1;

  const ohms = digitVal * multiplier;

  let tolPercent = 20;
  if (bandCount >= 4) {
    const tolKey = bands[digitCount + 1] || 'gold';
    tolPercent = RCC_COLORS[tolKey].tolerance ?? 5;
  }

  let tcr: number | null = null;
  if (bandCount === 6) {
    const tcrKey = bands[5] || 'brown';
    tcr = RCC_COLORS[tcrKey].tcr;
  }

  const minRes = ohms * (1 - tolPercent / 100);
  const maxRes = ohms * (1 + tolPercent / 100);

  const closestE24 = findClosestE24(ohms);

  return {
    resistanceOhms: ohms,
    formattedResistance: formatResistance(ohms),
    tolerancePercent: tolPercent,
    minResistance: Math.max(0, minRes),
    maxResistance: maxRes,
    tcr,
    eSeriesMatch: closestE24.formatted,
  };
}

export function findClosestE24(targetOhms: number): { value: number; formatted: string } {
  if (targetOhms <= 0) return { value: 0, formatted: '0 Ω' };

  const decade = Math.pow(10, Math.floor(Math.log10(targetOhms)));
  const normalized = targetOhms / decade;

  let closest = E24_BASE[0];
  let minDiff = Math.abs(normalized - closest);

  for (const base of E24_BASE) {
    const diff = Math.abs(normalized - base);
    if (diff < minDiff) {
      minDiff = diff;
      closest = base;
    }
  }

  const val = closest * decade;
  return { value: val, formatted: formatResistance(val) };
}

export function reverseRcc(
  targetOhms: number,
  bandCount: BandCount = 4,
  targetTolerancePercent: number = 5
): { bands: ColorKey[]; result: RccResult } {
  if (targetOhms <= 0) {
    const defaultBands: ColorKey[] =
      bandCount === 5 || bandCount === 6
        ? ['black', 'black', 'black', 'black', 'gold']
        : ['black', 'black', 'black', 'gold'];
    return { bands: defaultBands, result: calculateRcc(defaultBands, bandCount) };
  }

  const digitCount = bandCount === 5 || bandCount === 6 ? 3 : 2;

  // Find multiplier
  let exponent = Math.floor(Math.log10(targetOhms)) - (digitCount - 1);
  if (exponent < -2) exponent = -2;
  if (exponent > 9) exponent = 9;

  let mantissa = targetOhms / Math.pow(10, exponent);
  let roundedMantissa = Math.round(mantissa);

  if (roundedMantissa >= Math.pow(10, digitCount)) {
    roundedMantissa = Math.round(roundedMantissa / 10);
    exponent += 1;
  }

  // Convert rounded mantissa to digits
  const mantissaStr = roundedMantissa.toString().padStart(digitCount, '0');
  const bands: ColorKey[] = [];

  for (let i = 0; i < digitCount; i++) {
    const digitNum = parseInt(mantissaStr[i] || '0', 10);
    const digitColor =
      (Object.keys(RCC_COLORS) as ColorKey[]).find(
        (k) => RCC_COLORS[k].digit === digitNum
      ) || 'black';
    bands.push(digitColor);
  }

  // Multiplier color
  const multColor =
    (Object.keys(RCC_COLORS) as ColorKey[]).find(
      (k) => RCC_COLORS[k].multiplier === Math.pow(10, exponent)
    ) || 'black';
  bands.push(multColor);

  // Tolerance color
  if (bandCount >= 4) {
    const tolColor =
      (Object.keys(RCC_COLORS) as ColorKey[]).find(
        (k) => RCC_COLORS[k].tolerance === targetTolerancePercent
      ) || 'gold';
    bands.push(tolColor);
  }

  // TCR color
  if (bandCount === 6) {
    bands.push('brown'); // Default 100 ppm/K
  }

  const result = calculateRcc(bands, bandCount);
  return { bands, result };
}

export function calculateSmd(
  codeStr: string,
  mode: SmdMode
): { ohms: number; formatted: string; toleranceStr: string; codeStr: string } {
  const code = codeStr.trim().toUpperCase();
  if (!code) return { ohms: 0, formatted: '0 Ω', toleranceStr: '±5%', codeStr: '' };

  // Zero ohm jumper
  if (code === '0' || code === '00' || code === '000' || code === '0000') {
    return { ohms: 0, formatted: '0 Ω (Jumper)', toleranceStr: '0 Ω', codeStr: code };
  }

  // 3-Digit
  if (mode === '3digit') {
    if (code.includes('R')) {
      const parts = code.split('R');
      const val = parseFloat(`${parts[0] || '0'}.${parts[1] || '0'}`);
      return { ohms: val, formatted: formatResistance(val), toleranceStr: '±5%', codeStr: code };
    }
    if (/^\d{3}$/.test(code)) {
      const digits = parseInt(code.substring(0, 2), 10);
      const mult = parseInt(code.substring(2, 3), 10);
      const ohms = digits * Math.pow(10, mult);
      return { ohms, formatted: formatResistance(ohms), toleranceStr: '±5%', codeStr: code };
    }
  }

  // 4-Digit
  if (mode === '4digit') {
    if (code.includes('R')) {
      const parts = code.split('R');
      const val = parseFloat(`${parts[0] || '0'}.${parts[1] || '0'}`);
      return { ohms: val, formatted: formatResistance(val), toleranceStr: '±1%', codeStr: code };
    }
    if (/^\d{4}$/.test(code)) {
      const digits = parseInt(code.substring(0, 3), 10);
      const mult = parseInt(code.substring(3, 4), 10);
      const ohms = digits * Math.pow(10, mult);
      return { ohms, formatted: formatResistance(ohms), toleranceStr: '±1%', codeStr: code };
    }
  }

  // EIA-96
  if (mode === 'eia96' || code.length === 3) {
    const numPart = code.substring(0, 2);
    const multChar = code.substring(2, 3);
    if (EIA96_CODES[numPart] !== undefined && EIA96_MULTIPLIERS[multChar] !== undefined) {
      const baseVal = EIA96_CODES[numPart];
      const mult = EIA96_MULTIPLIERS[multChar];
      const ohms = baseVal * mult;
      return { ohms, formatted: formatResistance(ohms), toleranceStr: '±1%', codeStr: code };
    }
  }

  // Fallback / Special R processing
  if (code.includes('R')) {
    const val = parseFloat(code.replace('R', '.'));
    if (!isNaN(val)) {
      return { ohms: val, formatted: formatResistance(val), toleranceStr: '±1%', codeStr: code };
    }
  }

  return { ohms: 0, formatted: 'Invalid Code', toleranceStr: '—', codeStr: code };
}

export function reverseSmd(targetOhms: number): { code3: string; code4: string; codeEia96: string } {
  if (targetOhms <= 0) {
    return { code3: '000', code4: '0000', codeEia96: '01A' };
  }

  // Generate 3-Digit Code
  let code3 = '';
  if (targetOhms < 10) {
    code3 = `${trimNumber(targetOhms, 1).replace('.', 'R')}`;
  } else {
    const exponent = Math.floor(Math.log10(targetOhms)) - 1;
    const digits = Math.round(targetOhms / Math.pow(10, exponent));
    code3 = `${digits}${exponent}`;
  }

  // Generate 4-Digit Code
  let code4 = '';
  if (targetOhms < 100) {
    code4 = `${trimNumber(targetOhms, 2).replace('.', 'R')}`;
  } else {
    const exponent = Math.floor(Math.log10(targetOhms)) - 2;
    const digits = Math.round(targetOhms / Math.pow(10, exponent));
    code4 = `${digits}${exponent}`;
  }

  // Generate EIA-96 Code
  let codeEia96 = '01A';
  // Find nearest base in EIA-96
  const decade = Math.pow(10, Math.floor(Math.log10(targetOhms)));
  const normalized = targetOhms / decade;

  let bestCode = '01';
  let bestDiff = 99999;
  for (const [c, val] of Object.entries(EIA96_CODES)) {
    const baseVal = val / 100;
    const diff = Math.abs(normalized - baseVal);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestCode = c;
    }
  }

  // Find multiplier letter
  const multFactor = (EIA96_CODES[bestCode] / 100) * decade;
  let bestMultChar = 'A';
  let bestMultDiff = 99999;
  for (const [letter, m] of Object.entries(EIA96_MULTIPLIERS)) {
    const calculated = EIA96_CODES[bestCode] * m;
    const diff = Math.abs(targetOhms - calculated);
    if (diff < bestMultDiff) {
      bestMultDiff = diff;
      bestMultChar = letter;
    }
  }
  codeEia96 = `${bestCode}${bestMultChar}`;

  return { code3, code4, codeEia96 };
}

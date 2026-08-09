export type BandCount = 3 | 4 | 5 | 6;

export type ColorKey =
  | 'black'
  | 'brown'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'violet'
  | 'grey'
  | 'white'
  | 'gold'
  | 'silver'
  | 'none';

export interface ColorDef {
  key: ColorKey;
  name: string;
  hex: string;
  textColor: string;
  digit: number | null;
  multiplier: number | null;
  multiplierLabel: string;
  tolerance: number | null;
  tcr: number | null; // Temperature Coefficient in ppm/K (for 6th band)
}

export type SmdMode = '3digit' | '4digit' | 'eia96' | 'special';

export interface ResistorCalculation {
  id: string;
  type: 'rcc' | 'smd' | 'reverse';
  title: string;
  resistanceOhms: number;
  formattedResistance: string;
  tolerance: number; // percentage e.g. 5
  minResistance: number;
  maxResistance: number;
  bands?: ColorKey[];
  smdCode?: string;
  tcr?: number | null;
  eSeriesMatch?: string;
  notes?: string;
  timestamp: number;
}

export interface AiScanResult {
  type: 'through_hole' | 'smd' | 'unknown';
  bandCount?: BandCount;
  bands?: ColorKey[];
  smdCode?: string;
  resistanceOhms?: number;
  resistanceFormatted?: string;
  tolerance?: string;
  confidence?: 'high' | 'medium' | 'low';
  description?: string;
}

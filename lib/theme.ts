import { AccentName } from './types';

export interface Palette {
  bg: string;
  bgAlt: string;
  card: string;
  text: string;
  muted: string;
  primary: string;
  primaryText: string;
  secondary: string;
  accent: string;
  border: string;
  danger: string;
  success: string;
  warning: string;
  tabBar: string;
  header: string;
  input: string;
  overlay: string;
  flagGreen: string;
  flagWhite: string;
  flagBlue: string;
  shadow: string;
}

const accents: Record<AccentName, { primary: string; secondary: string; accent: string }> = {
  flag: { primary: '#1B7A3D', secondary: '#0072C6', accent: '#C9A227' },
  gold: { primary: '#B8860B', secondary: '#8B5A2B', accent: '#F0C14E' },
  ocean: { primary: '#0B6E99', secondary: '#1B7A3D', accent: '#3EC1D3' },
  forest: { primary: '#14532D', secondary: '#365314', accent: '#84CC16' },
  sunset: { primary: '#C2410C', secondary: '#9A3412', accent: '#F59E0B' },
  royal: { primary: '#4C1D95', secondary: '#1E3A8A', accent: '#C084FC' },
};

export function getPalette(dark: boolean, accent: AccentName): Palette {
  const a = accents[accent] ?? accents.flag;
  if (dark) {
    return {
      bg: '#0A1610',
      bgAlt: '#0F1E16',
      card: '#13241A',
      text: '#F2F7F3',
      muted: '#93A89A',
      primary: lighten(a.primary, 0.18),
      primaryText: '#06210F',
      secondary: lighten(a.secondary, 0.2),
      accent: lighten(a.accent, 0.12),
      border: '#1E3528',
      danger: '#F87171',
      success: '#4ADE80',
      warning: '#FBBF24',
      tabBar: '#0D1B13',
      header: '#0D1B13',
      input: '#0F1E16',
      overlay: 'rgba(0,0,0,0.62)',
      flagGreen: '#2F9E55',
      flagWhite: '#F8FAF8',
      flagBlue: '#3B9BE0',
      shadow: '#000000',
    };
  }
  return {
    bg: '#F3F7F2',
    bgAlt: '#E8F0E8',
    card: '#FFFFFF',
    text: '#0D1F14',
    muted: '#5A6B60',
    primary: a.primary,
    primaryText: '#FFFFFF',
    secondary: a.secondary,
    accent: a.accent,
    border: '#D5E3D6',
    danger: '#DC2626',
    success: '#15803D',
    warning: '#D97706',
    tabBar: '#FFFFFF',
    header: '#FFFFFF',
    input: '#F4F8F4',
    overlay: 'rgba(8,20,12,0.48)',
    flagGreen: '#1B7A3D',
    flagWhite: '#FFFFFF',
    flagBlue: '#0072C6',
    shadow: '#0D1F14',
  };
}

function lighten(hex: string, amount: number): string {
  const c = hex.replace('#', '');
  const num = parseInt(c, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;
  r = Math.min(255, Math.round(r + (255 - r) * amount));
  g = Math.min(255, Math.round(g + (255 - g) * amount));
  b = Math.min(255, Math.round(b + (255 - b) * amount));
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

export const ACCENT_OPTIONS: { key: AccentName; label: string; color: string }[] = [
  { key: 'flag', label: 'Salone Flag', color: '#1B7A3D' },
  { key: 'gold', label: 'Leone Gold', color: '#B8860B' },
  { key: 'ocean', label: 'Freetown Harbour', color: '#0B6E99' },
  { key: 'forest', label: 'Rainforest', color: '#14532D' },
  { key: 'sunset', label: 'Lumley Sunset', color: '#C2410C' },
  { key: 'royal', label: 'Cotton Tree Royal', color: '#4C1D95' },
];

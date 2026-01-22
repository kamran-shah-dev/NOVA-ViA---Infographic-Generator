
import { BrandConfig } from './types';

export const NOVA_VIA_BRAND: BrandConfig = {
  primary: '#034F80',    // Deep Ocean Blue
  accent: '#8F9185',     // Earthy Green
  background: '#EEEDE9', // Soft Off-White
  text: '#1A2633',       // Midnight Navy
  muted: '#818181',      // Sleek Gray
};

export const ACCENT_COLORS = [
  { id: 'ocean', label: 'Ocean Blue', value: '#034F80' },
  { id: 'earth', label: 'Earthy Green', value: '#8F9185' },
  { id: 'navy', label: 'Midnight Navy', value: '#1A2633' },
  { id: 'blue-grey', label: 'Blue Grey', value: '#2E3B4A' },
  { id: 'taupe', label: 'Gentle Taupe', value: '#E4DFD9' },
];

export const BACKGROUND_COLORS = [
  { id: 'white', label: 'Pure White', value: '#ffffff' },
  { id: 'offwhite', label: 'Soft Off-White', value: '#EEEDE9' },
  { id: 'taupe', label: 'Gentle Taupe', value: '#E4DFD9' },
  { id: 'navy', label: 'Midnight Navy', value: '#1A2633' },
  { id: 'grey', label: 'Sleek Gray', value: '#818181' },
];

export const CORNER_STYLES = [
  { id: 'sharp', label: 'Confident', radius: '0px' },
  { id: 'soft', label: 'Purposeful', radius: '12px' },
  { id: 'extra-soft', label: 'Compassionate', radius: '40px' },
];

export const BORDER_VARIANTS = [
  { id: 'solid', label: 'Bold' },
  { id: 'dashed', label: 'Intentional' },
  { id: 'none', label: 'Minimalist' },
];

export const LAYOUT_OPTIONS = [
  { id: 'vertical-cards', label: 'Vertical Step by Step', description: 'Deep narrative evolution' },
  { id: 'horizontal-steps', label: 'Horizontal Flow', description: 'Linear structural progression' },
  { id: 'timeline-flow', label: 'Vertical Flow', description: 'Empowered historical journey' },
  { id: 'multi-column', label: 'Columns', description: 'Complex data empowered' },
] as const;

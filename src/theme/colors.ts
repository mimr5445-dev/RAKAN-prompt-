/**
 * RAKAN Prompt - Theme & Color System
 * Default: Elegant Royal Brown & Warm Beige Theme
 */

export interface ColorPreset {
  id: string;
  nameAr: string;
  nameEn: string;
  primary: string;
  primaryDark: string;
  accent: string;
  bgLight: string;
  bgDark: string;
  cardLight: string;
  cardDark: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'royal_brown',
    nameAr: 'بُني ملكي وفاخر (الافتراضي)',
    nameEn: 'Royal Brown & Beige (Default)',
    primary: '#78350F', // Warm rich amber-brown
    primaryDark: '#B45309',
    accent: '#D97706', // Warm amber
    bgLight: '#FDFBF7', // Cream beige
    bgDark: '#1C1917', // Dark warm stone
    cardLight: '#FFFFFF',
    cardDark: '#292524',
  },
  {
    id: 'terracotta_desert',
    nameAr: 'صحراوي دافئ',
    nameEn: 'Desert Terracotta',
    primary: '#9A3412',
    primaryDark: '#EA580C',
    accent: '#F97316',
    bgLight: '#FFFBEB',
    bgDark: '#1A1816',
    cardLight: '#FFFFFF',
    cardDark: '#282522',
  },
  {
    id: 'emerald_luxury',
    nameAr: 'زمردي راقي',
    nameEn: 'Emerald Luxury',
    primary: '#065F46',
    primaryDark: '#059669',
    accent: '#10B981',
    bgLight: '#F0FDF4',
    bgDark: '#121C18',
    cardLight: '#FFFFFF',
    cardDark: '#1E2A24',
  },
  {
    id: 'sapphire_night',
    nameAr: 'ياقوتي ليلي',
    nameEn: 'Sapphire Night',
    primary: '#1E3A8A',
    primaryDark: '#2563EB',
    accent: '#3B82F6',
    bgLight: '#EFF6FF',
    bgDark: '#0F172A',
    cardLight: '#FFFFFF',
    cardDark: '#1E293B',
  },
  {
    id: 'rose_gold',
    nameAr: 'وردي ذهبي',
    nameEn: 'Rose Gold',
    primary: '#9F1239',
    primaryDark: '#E11D48',
    accent: '#F43F5E',
    bgLight: '#FFF1F2',
    bgDark: '#1F1316',
    cardLight: '#FFFFFF',
    cardDark: '#2D1B20',
  },
  {
    id: 'obsidian_gold',
    nameAr: 'أوبسيديان وذهب',
    nameEn: 'Obsidian & Gold',
    primary: '#27272A',
    primaryDark: '#EAB308',
    accent: '#F59E0B',
    bgLight: '#FAFAFA',
    bgDark: '#09090B',
    cardLight: '#FFFFFF',
    cardDark: '#18181B',
  },
];

export const LABEL_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#71717A', // Slate
];

export const CATEGORY_ICONS = [
  'Folder',
  'Image',
  'Sparkles',
  'User',
  'Camera',
  'Palette',
  'Box',
  'Cpu',
  'Zap',
  'Globe',
  'Building',
  'Crown',
  'BookOpen',
  'Code',
  'Feather',
  'Sun',
  'Moon',
  'Star',
  'Heart',
  'Compass',
  'Flame',
  'PenTool',
  'Wand2',
  'Layers',
];

export const CATEGORY_EMOJIS = [
  '🖼️', '🎨', '👤', '📸', '🏞️', '🏛️', '🤖', '⚡',
  '✨', '🔥', '👑', '🌌', '🚀', '🔮', '🎭', '✍️',
  '💻', '💡', '📚', '🎯', '🌈', '🧩', '🏆', '💎'
];

export const PRESET_PALETTES: Record<string, Record<string, string>> = {
  // 1. Royal Brown & Beige (Default Amber)
  '#78350F': {
    '50': '#fffbeb',
    '100': '#fef3c7',
    '200': '#fde68a',
    '300': '#fcd34d',
    '400': '#fbbf24',
    '500': '#f59e0b',
    '600': '#d97706',
    '700': '#b45309',
    '800': '#92400e',
    '900': '#78350f',
    '950': '#451a03',
  },
  // 2. Desert Terracotta (Orange / Terracotta)
  '#9A3412': {
    '50': '#fff7ed',
    '100': '#ffedd5',
    '200': '#fed7aa',
    '300': '#fdba74',
    '400': '#fb923c',
    '500': '#f97316',
    '600': '#ea580c',
    '700': '#c2410c',
    '800': '#9a3412',
    '900': '#7c2d12',
    '950': '#431407',
  },
  // 3. Emerald Luxury (Emerald Green)
  '#065F46': {
    '50': '#ecfdf5',
    '100': '#d1fae5',
    '200': '#a7f3d0',
    '300': '#6ee7b7',
    '400': '#34d399',
    '500': '#10b981',
    '600': '#059669',
    '700': '#047857',
    '800': '#065f46',
    '900': '#064e3b',
    '950': '#022c22',
  },
  // 4. Sapphire Night (Blue)
  '#1E3A8A': {
    '50': '#eff6ff',
    '100': '#dbeafe',
    '200': '#bfdbfe',
    '300': '#93c5fd',
    '400': '#60a5fa',
    '500': '#3b82f6',
    '600': '#2563eb',
    '700': '#1d4ed8',
    '800': '#1e40af',
    '900': '#1e3a8a',
    '950': '#172554',
  },
  // 5. Rose Gold (Rose / Pink)
  '#9F1239': {
    '50': '#fff1f2',
    '100': '#ffe4e6',
    '200': '#fecdd3',
    '300': '#fda4af',
    '400': '#fb7185',
    '500': '#f43f5e',
    '600': '#e11d48',
    '700': '#be123c',
    '800': '#9f1239',
    '900': '#881337',
    '950': '#4c0519',
  },
  // 6. Obsidian & Gold (Zinc / Yellow Gold)
  '#27272A': {
    '50': '#fefce8',
    '100': '#fef9c3',
    '200': '#fef08a',
    '300': '#fde047',
    '400': '#facc15',
    '500': '#eab308',
    '600': '#ca8a04',
    '700': '#a16207',
    '800': '#854d0e',
    '900': '#27272a',
    '950': '#09090b',
  },
};


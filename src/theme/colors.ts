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

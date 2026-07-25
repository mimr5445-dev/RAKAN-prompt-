/**
 * RAKAN Prompt - Type Definitions
 */

export type Language = 'ar' | 'en';

export type ViewMode = 'grid' | 'compact' | 'list' | 'large' | 'small';

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'updated'
  | 'alphabetical'
  | 'favorites'
  | 'pinned'
  | 'rating'
  | 'most_used'
  | 'manual';

export interface PromptVersion {
  id: string;
  prompt: string;
  negativePrompt: string;
  notes: string;
  timestamp: string;
  versionNumber: number;
  changeNote?: string;
}

export interface PromptItem {
  id: string;
  categoryId: string;
  sectionId: string;
  title: string;
  prompt: string;
  negativePrompt: string;
  notes: string;
  tags: string[];
  images: string[]; // Base64 data URLs or image URLs
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
  usedCount: number;
  version: number;
  versions?: PromptVersion[];
  rating: number; // 1 to 5
  colorLabel?: string; // Hex color code
  emoji?: string;
  isDeleted: boolean;
  deletedAt?: string;
}

export interface Category {
  id: string;
  sectionId: string;
  name: string;
  icon: string; // Lucide icon name or emoji
  color: string;
  order: number;
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  name: string;
  order: number;
  isPinned: boolean;
  isFavorite: boolean;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface AppSettings {
  language: Language;
  themeMode: 'light' | 'dark' | 'auto';
  primaryColor: string; // Preset or custom hex
  accentColor: string;
  cardStyle: 'flat' | 'bordered' | 'glass' | 'elevated';
  cornerRadius: 'sm' | 'md' | 'lg' | 'xl';
  fontFamily: 'cairo' | 'tajawal' | 'system';
  viewMode: ViewMode;
  autoSaveInterval: number; // in seconds
  autoCleanupDays: number; // for trash, 0 = disabled
  securityPin: string | null; // 4 digit PIN
  isSecurityEnabled: boolean;
  isBiometricsSimulated: boolean;
  showLineNumbers: boolean;
  editorMonospace: boolean;
  hapticsEnabled: boolean;
}

export interface BackupData {
  version: string;
  timestamp: string;
  sections: Section[];
  categories: Category[];
  prompts: PromptItem[];
  tags: Tag[];
  settings?: Partial<AppSettings>;
}

export interface ActivityLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'restore' | 'export' | 'import';
  itemType: 'section' | 'category' | 'prompt' | 'backup';
  title: string;
  timestamp: string;
}

export interface PromptFilter {
  searchQuery: string;
  favoritesOnly: boolean;
  pinnedOnly: boolean;
  withImagesOnly: boolean;
  withoutImagesOnly: boolean;
  selectedTag?: string;
  minRating?: number;
  colorLabel?: string;
}

export interface LibraryStats {
  totalSections: number;
  totalCategories: number;
  totalPrompts: number;
  totalImages: number;
  totalFavorites: number;
  totalPinned: number;
  totalTags: number;
  estimatedSizeMB: number;
}

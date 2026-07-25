/**
 * RAKAN Prompt - Central Application Context & State Manager
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Section,
  Category,
  PromptItem,
  Tag,
  AppSettings,
  ViewMode,
  SortOption,
  PromptFilter,
  Language,
  LibraryStats,
  PromptVersion,
} from '../types';
import { dbEngine } from '../db/indexedDB';
import { getTranslation, TranslationKey } from '../locales';
import confetti from 'canvas-confetti';

interface AppContextType {
  // State
  sections: Section[];
  categories: Category[];
  prompts: PromptItem[];
  tags: Tag[];
  settings: AppSettings;
  activeSectionId: string | null;
  activeCategoryId: string | null;
  selectedPrompt: PromptItem | null;
  
  // Navigation & Modals
  activeTab: 'home' | 'search' | 'favorites' | 'tags' | 'settings';
  setActiveTab: (tab: 'home' | 'search' | 'favorites' | 'tags' | 'settings') => void;
  isSideDrawerOpen: boolean;
  setIsSideDrawerOpen: (open: boolean) => void;
  activeModal:
    | 'create_section'
    | 'edit_section'
    | 'create_category'
    | 'edit_category'
    | 'create_prompt'
    | 'edit_prompt'
    | 'prompt_detail'
    | 'backup_manager'
    | 'trash_bin'
    | 'stats_dashboard'
    | 'pin_lock'
    | null;
  setActiveModal: (modal: any) => void;
  
  // Filter & Sort & Search
  filter: PromptFilter;
  setFilter: React.Dispatch<React.SetStateAction<PromptFilter>>;
  sortOption: SortOption;
  setSortOption: (sort: SortOption) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // Editing state for modals
  editingSection: Section | null;
  setEditingSection: (s: Section | null) => void;
  editingCategory: Category | null;
  setEditingCategory: (c: Category | null) => void;
  editingPrompt: PromptItem | null;
  setEditingPrompt: (p: PromptItem | null) => void;

  // Security
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;

  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Translation Helper
  t: (key: TranslationKey) => string;

  // Section Operations
  createSection: (name: string) => Promise<Section>;
  updateSection: (section: Section) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;
  togglePinSection: (id: string) => Promise<void>;
  toggleFavoriteSection: (id: string) => Promise<void>;
  reorderSections: (reordered: Section[]) => Promise<void>;
  setActiveSectionId: (id: string | null) => void;

  // Category Operations
  createCategory: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => Promise<Category>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  duplicateCategory: (id: string) => Promise<void>;
  togglePinCategory: (id: string) => Promise<void>;
  toggleFavoriteCategory: (id: string) => Promise<void>;
  reorderCategories: (reordered: Category[]) => Promise<void>;
  setActiveCategoryId: (id: string | null) => void;

  // Prompt Operations
  createPrompt: (data: Partial<PromptItem>) => Promise<PromptItem>;
  updatePrompt: (prompt: PromptItem) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  restorePrompt: (id: string) => Promise<void>;
  deletePromptPermanently: (id: string) => Promise<void>;
  toggleFavoritePrompt: (id: string) => Promise<void>;
  togglePinPrompt: (id: string) => Promise<void>;
  copyToClipboard: (text: string, label?: string) => void;
  restorePromptVersion: (promptId: string, version: PromptVersion) => Promise<void>;
  setSelectedPrompt: (p: PromptItem | null) => void;

  // Tag Operations
  addTag: (name: string, color?: string) => Promise<Tag>;
  mergeTags: (targetTagId: string, tagIdsToMerge: string[]) => Promise<void>;
  renameTagGlobally: (tagId: string, newName: string) => Promise<void>;
  deleteTagGlobally: (tagId: string) => Promise<void>;

  // Settings & Theme Operations
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  resetApplication: () => Promise<void>;
  emptyTrash: () => Promise<void>;

  // Stats & Helper
  stats: LibraryStats;
  filteredPrompts: PromptItem[];
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'ar',
  themeMode: 'auto',
  primaryColor: '#78350F',
  accentColor: '#D97706',
  cardStyle: 'bordered',
  cornerRadius: 'md',
  fontFamily: 'cairo',
  viewMode: 'grid',
  autoSaveInterval: 30,
  autoCleanupDays: 30,
  securityPin: null,
  isSecurityEnabled: false,
  isBiometricsSimulated: false,
  showLineNumbers: true,
  editorMonospace: true,
  hapticsEnabled: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);

  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'favorites' | 'tags' | 'settings'>('home');
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<any>(null);

  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<PromptItem | null>(null);

  const [filter, setFilter] = useState<PromptFilter>({
    searchQuery: '',
    favoritesOnly: false,
    pinnedOnly: false,
    withImagesOnly: false,
    withoutImagesOnly: false,
  });

  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Translation function shorthand
  const t = useCallback((key: TranslationKey) => getTranslation(settings.language, key), [settings.language]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Initialize DB and load initial state
  useEffect(() => {
    const initApp = async () => {
      try {
        await dbEngine.init();

        const [dbSections, dbCategories, dbPrompts, dbTags, dbSettings] = await Promise.all([
          dbEngine.getAllSections(),
          dbEngine.getAllCategories(),
          dbEngine.getAllPrompts(),
          dbEngine.getAllTags(),
          dbEngine.getSettings(),
        ]);

        if (dbSettings) {
          const mergedSettings = { ...DEFAULT_SETTINGS, ...dbSettings };
          setSettings(mergedSettings);
          setViewMode(mergedSettings.viewMode);
          if (mergedSettings.isSecurityEnabled && mergedSettings.securityPin) {
            setIsLocked(true);
          }
        }

        setSections(dbSections.sort((a, b) => a.order - b.order));
        setCategories(dbCategories.sort((a, b) => a.order - b.order));
        setPrompts(dbPrompts);
        setTags(dbTags);

        // Start at root level (Sections overview) by default
        setActiveSectionId(null);
        setActiveCategoryId(null);
      } catch (err) {
        console.error('Failed to initialize local IndexedDB:', err);
      }
    };

    initApp();
  }, []);

  // Update document direction (RTL for Arabic, LTR for English)
  useEffect(() => {
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = settings.language;
  }, [settings.language]);

  // Section Operations
  const createSection = async (name: string): Promise<Section> => {
    const newSection: Section = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      order: sections.length,
      isPinned: false,
      isFavorite: false,
      isHidden: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dbEngine.saveSection(newSection);
    const updated = [...sections, newSection];
    setSections(updated);
    setActiveSectionId(newSection.id);
    setActiveCategoryId(null);
    showToast(t('toastCreated'));
    return newSection;
  };

  const updateSection = async (section: Section): Promise<void> => {
    const updatedSection = { ...section, updatedAt: new Date().toISOString() };
    await dbEngine.saveSection(updatedSection);
    setSections((prev) => prev.map((s) => (s.id === section.id ? updatedSection : s)));
    showToast(t('toastUpdated'));
  };

  const deleteSection = async (id: string): Promise<void> => {
    // Delete section, its categories and prompts
    await dbEngine.deleteSection(id);

    const catsToDelete = categories.filter((c) => c.sectionId === id);
    for (const c of catsToDelete) {
      await dbEngine.deleteCategory(c.id);
    }

    const promptsToDelete = prompts.filter((p) => p.sectionId === id);
    for (const p of promptsToDelete) {
      await dbEngine.deletePrompt(p.id);
    }

    setSections((prev) => prev.filter((s) => s.id !== id));
    setCategories((prev) => prev.filter((c) => c.sectionId !== id));
    setPrompts((prev) => prev.filter((p) => p.sectionId !== id));

    if (activeSectionId === id) {
      setActiveSectionId(null);
      setActiveCategoryId(null);
    }

    showToast(t('toastDeleted'));
  };

  const togglePinSection = async (id: string): Promise<void> => {
    const sec = sections.find((s) => s.id === id);
    if (sec) {
      const updated = { ...sec, isPinned: !sec.isPinned, updatedAt: new Date().toISOString() };
      await dbEngine.saveSection(updated);
      setSections((prev) => prev.map((s) => (s.id === id ? updated : s)));
    }
  };

  const toggleFavoriteSection = async (id: string): Promise<void> => {
    const sec = sections.find((s) => s.id === id);
    if (sec) {
      const updated = { ...sec, isFavorite: !sec.isFavorite, updatedAt: new Date().toISOString() };
      await dbEngine.saveSection(updated);
      setSections((prev) => prev.map((s) => (s.id === id ? updated : s)));
    }
  };

  const reorderSections = async (reordered: Section[]): Promise<void> => {
    const updated = reordered.map((s, idx) => ({ ...s, order: idx }));
    setSections(updated);
    for (const s of updated) {
      await dbEngine.saveSection(s);
    }
  };

  // Category Operations
  const createCategory = async (
    data: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'order'>
  ): Promise<Category> => {
    const sectionCats = categories.filter((c) => c.sectionId === data.sectionId);
    const newCat: Category = {
      ...data,
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      order: sectionCats.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dbEngine.saveCategory(newCat);
    setCategories((prev) => [...prev, newCat]);
    setActiveCategoryId(newCat.id);
    showToast(t('toastCreated'));
    return newCat;
  };

  const updateCategory = async (category: Category): Promise<void> => {
    const updated = { ...category, updatedAt: new Date().toISOString() };
    await dbEngine.saveCategory(updated);
    setCategories((prev) => prev.map((c) => (c.id === category.id ? updated : c)));
    showToast(t('toastUpdated'));
  };

  const deleteCategory = async (id: string): Promise<void> => {
    await dbEngine.deleteCategory(id);
    const promptsToDelete = prompts.filter((p) => p.categoryId === id);
    for (const p of promptsToDelete) {
      await dbEngine.deletePrompt(p.id);
    }

    setCategories((prev) => prev.filter((c) => c.id !== id));
    setPrompts((prev) => prev.filter((p) => p.categoryId !== id));

    if (activeCategoryId === id) {
      setActiveCategoryId(null);
    }

    showToast(t('toastDeleted'));
  };

  const duplicateCategory = async (id: string): Promise<void> => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;

    const newCat: Category = {
      ...cat,
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: `${cat.name} (${t('duplicate')})`,
      order: categories.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dbEngine.saveCategory(newCat);

    // Duplicate all prompt items in this category
    const catPrompts = prompts.filter((p) => p.categoryId === id && !p.isDeleted);
    const duplicatedPrompts: PromptItem[] = [];

    for (const p of catPrompts) {
      const dupPrompt: PromptItem = {
        ...p,
        id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        categoryId: newCat.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await dbEngine.savePrompt(dupPrompt);
      duplicatedPrompts.push(dupPrompt);
    }

    setCategories((prev) => [...prev, newCat]);
    setPrompts((prev) => [...prev, ...duplicatedPrompts]);
    showToast(t('toastCreated'));
  };

  const togglePinCategory = async (id: string): Promise<void> => {
    const cat = categories.find((c) => c.id === id);
    if (cat) {
      const updated = { ...cat, isPinned: !cat.isPinned, updatedAt: new Date().toISOString() };
      await dbEngine.saveCategory(updated);
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }
  };

  const toggleFavoriteCategory = async (id: string): Promise<void> => {
    const cat = categories.find((c) => c.id === id);
    if (cat) {
      const updated = { ...cat, isFavorite: !cat.isFavorite, updatedAt: new Date().toISOString() };
      await dbEngine.saveCategory(updated);
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }
  };

  const reorderCategories = async (reordered: Category[]): Promise<void> => {
    const updated = reordered.map((c, idx) => ({ ...c, order: idx }));
    setCategories((prev) => {
      const rest = prev.filter((c) => !updated.some((u) => u.id === c.id));
      return [...rest, ...updated];
    });
    for (const c of updated) {
      await dbEngine.saveCategory(c);
    }
  };

  // Prompt Operations
  const createPrompt = async (data: Partial<PromptItem>): Promise<PromptItem> => {
    const now = new Date().toISOString();
    const newPrompt: PromptItem = {
      id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      categoryId: data.categoryId || activeCategoryId || '',
      sectionId: data.sectionId || activeSectionId || '',
      title: (data.title || '').trim(),
      prompt: (data.prompt || '').trim(),
      negativePrompt: (data.negativePrompt || '').trim(),
      notes: (data.notes || '').trim(),
      tags: data.tags || [],
      images: data.images || [],
      isFavorite: data.isFavorite || false,
      isPinned: data.isPinned || false,
      createdAt: now,
      updatedAt: now,
      usedCount: 0,
      version: 1,
      versions: [
        {
          id: `v_1_${Date.now()}`,
          prompt: (data.prompt || '').trim(),
          negativePrompt: (data.negativePrompt || '').trim(),
          notes: (data.notes || '').trim(),
          timestamp: now,
          versionNumber: 1,
          changeNote: 'النسخة الأولية',
        },
      ],
      rating: data.rating || 5,
      colorLabel: data.colorLabel,
      emoji: data.emoji,
      isDeleted: false,
    };

    await dbEngine.savePrompt(newPrompt);
    setPrompts((prev) => [newPrompt, ...prev]);

    // Automatically add unknown tags to Global Tags list
    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        if (!tags.some((t) => t.name.toLowerCase() === tagName.toLowerCase())) {
          await addTag(tagName);
        }
      }
    }

    showToast(t('toastCreated'));
    return newPrompt;
  };

  const updatePrompt = async (prompt: PromptItem): Promise<void> => {
    const now = new Date().toISOString();
    const existing = prompts.find((p) => p.id === prompt.id);

    let newVersionNumber = prompt.version;
    let updatedVersions = prompt.versions || [];

    // Check if prompt text or negative prompt changed to append version history
    if (existing && (existing.prompt !== prompt.prompt || existing.negativePrompt !== prompt.negativePrompt)) {
      newVersionNumber += 1;
      const versionEntry: PromptVersion = {
        id: `v_${newVersionNumber}_${Date.now()}`,
        prompt: prompt.prompt,
        negativePrompt: prompt.negativePrompt,
        notes: prompt.notes,
        timestamp: now,
        versionNumber: newVersionNumber,
      };
      updatedVersions = [versionEntry, ...updatedVersions];
    }

    const updated: PromptItem = {
      ...prompt,
      version: newVersionNumber,
      versions: updatedVersions,
      updatedAt: now,
    };

    await dbEngine.savePrompt(updated);
    setPrompts((prev) => prev.map((p) => (p.id === prompt.id ? updated : p)));
    if (selectedPrompt && selectedPrompt.id === prompt.id) {
      setSelectedPrompt(updated);
    }
    showToast(t('toastUpdated'));
  };

  const deletePrompt = async (id: string): Promise<void> => {
    const target = prompts.find((p) => p.id === id);
    if (!target) return;

    const updated: PromptItem = {
      ...target,
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    };

    await dbEngine.savePrompt(updated);
    setPrompts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    if (selectedPrompt && selectedPrompt.id === id) {
      setSelectedPrompt(null);
    }
    showToast(t('toastDeleted'));
  };

  const restorePrompt = async (id: string): Promise<void> => {
    const target = prompts.find((p) => p.id === id);
    if (!target) return;

    const updated: PromptItem = {
      ...target,
      isDeleted: false,
      deletedAt: undefined,
    };

    await dbEngine.savePrompt(updated);
    setPrompts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    showToast(t('toastRestored'));
  };

  const deletePromptPermanently = async (id: string): Promise<void> => {
    await dbEngine.deletePrompt(id);
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    showToast(t('toastDeleted'));
  };

  const toggleFavoritePrompt = async (id: string): Promise<void> => {
    const p = prompts.find((item) => item.id === id);
    if (p) {
      const updated = { ...p, isFavorite: !p.isFavorite, updatedAt: new Date().toISOString() };
      await dbEngine.savePrompt(updated);
      setPrompts((prev) => prev.map((item) => (item.id === id ? updated : item)));
      if (selectedPrompt && selectedPrompt.id === id) setSelectedPrompt(updated);
    }
  };

  const togglePinPrompt = async (id: string): Promise<void> => {
    const p = prompts.find((item) => item.id === id);
    if (p) {
      const updated = { ...p, isPinned: !p.isPinned, updatedAt: new Date().toISOString() };
      await dbEngine.savePrompt(updated);
      setPrompts((prev) => prev.map((item) => (item.id === id ? updated : item)));
      if (selectedPrompt && selectedPrompt.id === id) setSelectedPrompt(updated);
    }
  };

  const copyToClipboard = (text: string, label = '') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast(`${t('copied')} ${label}`);

    // Increment usage count for prompt
    if (selectedPrompt && selectedPrompt.prompt === text) {
      const updated = {
        ...selectedPrompt,
        usedCount: (selectedPrompt.usedCount || 0) + 1,
        lastUsedAt: new Date().toISOString(),
      };
      dbEngine.savePrompt(updated);
      setPrompts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }

    // Gentle confetti feedback
    try {
      confetti({
        particleCount: 20,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#D97706', '#78350F', '#10B981'],
      });
    } catch {
      // Ignore if confetti fails
    }
  };

  const restorePromptVersion = async (promptId: string, version: PromptVersion): Promise<void> => {
    const target = prompts.find((p) => p.id === promptId);
    if (!target) return;

    const updated: PromptItem = {
      ...target,
      prompt: version.prompt,
      negativePrompt: version.negativePrompt,
      notes: version.notes,
      updatedAt: new Date().toISOString(),
    };

    await updatePrompt(updated);
    showToast(t('toastRestored'));
  };

  // Tag Operations
  const addTag = async (name: string, color = '#D97706'): Promise<Tag> => {
    const cleanName = name.trim();
    const existing = tags.find((t) => t.name.toLowerCase() === cleanName.toLowerCase());
    if (existing) return existing;

    const newTag: Tag = {
      id: `tag_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: cleanName,
      color,
      createdAt: new Date().toISOString(),
    };

    await dbEngine.saveTag(newTag);
    setTags((prev) => [...prev, newTag]);
    return newTag;
  };

  const mergeTags = async (targetTagId: string, tagIdsToMerge: string[]): Promise<void> => {
    const targetTag = tags.find((t) => t.id === targetTagId);
    if (!targetTag) return;

    const sourceTagNames = tags.filter((t) => tagIdsToMerge.includes(t.id)).map((t) => t.name);

    // Update all prompts that have source tag names
    const updatedPrompts: PromptItem[] = [];
    for (const p of prompts) {
      const hasSourceTag = p.tags.some((tagName) => sourceTagNames.includes(tagName));
      if (hasSourceTag) {
        const newTagsSet = new Set(p.tags.filter((tagName) => !sourceTagNames.includes(tagName)));
        newTagsSet.add(targetTag.name);
        const updatedPrompt = { ...p, tags: Array.from(newTagsSet) };
        await dbEngine.savePrompt(updatedPrompt);
        updatedPrompts.push(updatedPrompt);
      }
    }

    // Delete merged tags
    for (const tagId of tagIdsToMerge) {
      await dbEngine.deleteTag(tagId);
    }

    setTags((prev) => prev.filter((t) => !tagIdsToMerge.includes(t.id)));
    setPrompts((prev) => prev.map((p) => updatedPrompts.find((u) => u.id === p.id) || p));
    showToast(t('toastUpdated'));
  };

  const renameTagGlobally = async (tagId: string, newName: string): Promise<void> => {
    const tag = tags.find((t) => t.id === tagId);
    if (!tag) return;

    const oldName = tag.name;
    const cleanNewName = newName.trim();
    const updatedTag = { ...tag, name: cleanNewName };

    await dbEngine.saveTag(updatedTag);

    // Update prompts
    const updatedPrompts: PromptItem[] = [];
    for (const p of prompts) {
      if (p.tags.includes(oldName)) {
        const updatedPrompt = {
          ...p,
          tags: p.tags.map((tName) => (tName === oldName ? cleanNewName : tName)),
        };
        await dbEngine.savePrompt(updatedPrompt);
        updatedPrompts.push(updatedPrompt);
      }
    }

    setTags((prev) => prev.map((t) => (t.id === tagId ? updatedTag : t)));
    setPrompts((prev) => prev.map((p) => updatedPrompts.find((u) => u.id === p.id) || p));
    showToast(t('toastUpdated'));
  };

  const deleteTagGlobally = async (tagId: string): Promise<void> => {
    const tag = tags.find((t) => t.id === tagId);
    if (!tag) return;

    await dbEngine.deleteTag(tagId);

    // Remove tag from prompts
    const updatedPrompts: PromptItem[] = [];
    for (const p of prompts) {
      if (p.tags.includes(tag.name)) {
        const updatedPrompt = {
          ...p,
          tags: p.tags.filter((tName) => tName !== tag.name),
        };
        await dbEngine.savePrompt(updatedPrompt);
        updatedPrompts.push(updatedPrompt);
      }
    }

    setTags((prev) => prev.filter((t) => t.id !== tagId));
    setPrompts((prev) => prev.map((p) => updatedPrompts.find((u) => u.id === p.id) || p));
    showToast(t('toastDeleted'));
  };

  // Settings & Theme Operations
  const updateSettings = async (newSettings: Partial<AppSettings>): Promise<void> => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    await dbEngine.saveSettings(merged);
    showToast(t('toastUpdated'));
  };

  const resetApplication = async (): Promise<void> => {
    await dbEngine.clearAllData();
    setSections([]);
    setCategories([]);
    setPrompts([]);
    setTags([]);
    setSettings(DEFAULT_SETTINGS);
    setActiveSectionId(null);
    setActiveCategoryId(null);
    setSelectedPrompt(null);
    showToast(t('toastUpdated'));
  };

  const emptyTrash = async (): Promise<void> => {
    const deletedPrompts = prompts.filter((p) => p.isDeleted);
    for (const p of deletedPrompts) {
      await dbEngine.deletePrompt(p.id);
    }
    setPrompts((prev) => prev.filter((p) => !p.isDeleted));
    showToast(t('toastUpdated'));
  };

  // Filtered & Sorted Prompts Calculation
  const filteredPrompts = useMemo(() => {
    let list = prompts.filter((p) => !p.isDeleted);

    // Filter by Active Category / Section when in Home tab
    if (activeTab === 'home') {
      if (activeCategoryId) {
        list = list.filter((p) => p.categoryId === activeCategoryId);
      } else if (activeSectionId) {
        list = list.filter((p) => p.sectionId === activeSectionId);
      }
    } else if (activeTab === 'favorites') {
      list = list.filter((p) => p.isFavorite);
    }

    // Apply Filter Criteria
    if (filter.favoritesOnly) {
      list = list.filter((p) => p.isFavorite);
    }
    if (filter.pinnedOnly) {
      list = list.filter((p) => p.isPinned);
    }
    if (filter.withImagesOnly) {
      list = list.filter((p) => p.images && p.images.length > 0);
    }
    if (filter.withoutImagesOnly) {
      list = list.filter((p) => !p.images || p.images.length === 0);
    }
    if (filter.selectedTag) {
      list = list.filter((p) => p.tags.includes(filter.selectedTag!));
    }
    if (filter.minRating) {
      list = list.filter((p) => p.rating >= filter.minRating!);
    }
    if (filter.colorLabel) {
      list = list.filter((p) => p.colorLabel === filter.colorLabel);
    }

    // Search Query Matching across Titles, Prompt, Negative Prompt, Notes, Tags
    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.prompt.toLowerCase().includes(q) ||
          p.negativePrompt.toLowerCase().includes(q) ||
          p.notes.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Apply Sorting (Pinned always first)
    list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      switch (sortOption) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'favorites':
          return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
        case 'rating':
          return b.rating - a.rating;
        case 'most_used':
          return (b.usedCount || 0) - (a.usedCount || 0);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return list;
  }, [prompts, activeTab, activeCategoryId, activeSectionId, filter, sortOption]);

  // Statistics Calculation
  const stats = useMemo<LibraryStats>(() => {
    const activePrompts = prompts.filter((p) => !p.isDeleted);
    const totalImages = activePrompts.reduce((acc, p) => acc + (p.images ? p.images.length : 0), 0);

    // Approximate size in MB based on stringified length
    const jsonStr = JSON.stringify({ sections, categories, prompts, tags });
    const sizeBytes = new Blob([jsonStr]).size;
    const sizeMB = parseFloat((sizeBytes / (1024 * 1024)).toFixed(2));

    return {
      totalSections: sections.length,
      totalCategories: categories.length,
      totalPrompts: activePrompts.length,
      totalImages,
      totalFavorites: activePrompts.filter((p) => p.isFavorite).length,
      totalPinned: activePrompts.filter((p) => p.isPinned).length,
      totalTags: tags.length,
      estimatedSizeMB: sizeMB,
    };
  }, [sections, categories, prompts, tags]);

  return (
    <AppContext.Provider
      value={{
        sections,
        categories,
        prompts,
        tags,
        settings,
        activeSectionId,
        activeCategoryId,
        selectedPrompt,
        activeTab,
        setActiveTab,
        isSideDrawerOpen,
        setIsSideDrawerOpen,
        activeModal,
        setActiveModal,
        filter,
        setFilter,
        sortOption,
        setSortOption,
        viewMode,
        setViewMode,
        editingSection,
        setEditingSection,
        editingCategory,
        setEditingCategory,
        editingPrompt,
        setEditingPrompt,
        isLocked,
        setIsLocked,
        toastMessage,
        showToast,
        t,
        createSection,
        updateSection,
        deleteSection,
        togglePinSection,
        toggleFavoriteSection,
        reorderSections,
        setActiveSectionId,
        createCategory,
        updateCategory,
        deleteCategory,
        duplicateCategory,
        togglePinCategory,
        toggleFavoriteCategory,
        reorderCategories,
        setActiveCategoryId,
        createPrompt,
        updatePrompt,
        deletePrompt,
        restorePrompt,
        deletePromptPermanently,
        toggleFavoritePrompt,
        togglePinPrompt,
        copyToClipboard,
        restorePromptVersion,
        setSelectedPrompt,
        addTag,
        mergeTags,
        renameTagGlobally,
        deleteTagGlobally,
        updateSettings,
        resetApplication,
        emptyTrash,
        stats,
        filteredPrompts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

/**
 * RAKAN Prompt - iOS Mobile Top Navigation Header
 */

import React from 'react';
import { Menu, Plus, Search, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    t,
    setIsSideDrawerOpen,
    setActiveModal,
    activeTab,
    setActiveTab,
    setEditingPrompt,
    setEditingSection,
    setEditingCategory,
    activeSectionId,
    activeCategoryId,
    filter,
    setFilter,
  } = useApp();

  const handleOpenAdd = () => {
    if (activeTab === 'home') {
      if (!activeSectionId) {
        setEditingSection(null);
        setActiveModal('create_section');
        return;
      }
      if (activeSectionId && !activeCategoryId) {
        setEditingCategory(null);
        setActiveModal('create_category');
        return;
      }
    }
    setEditingPrompt(null);
    setActiveModal('create_prompt');
  };

  const getAddLabel = () => {
    if (activeTab === 'home') {
      if (!activeSectionId) return 'قسم';
      if (!activeCategoryId) return 'مجلد';
    }
    return t('add');
  };

  return (
    <header className="w-full px-4 py-3 bg-stone-100/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0 z-30">
      {/* Left Menu Hamburger Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsSideDrawerOpen(true)}
          className="p-2 rounded-xl bg-stone-200/70 dark:bg-stone-800/80 text-stone-800 dark:text-stone-200 hover:bg-amber-500/20 active:scale-95 transition-all"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Name */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-200 bg-clip-text text-transparent">
              RAKAN
            </span>
            <span className="text-xs font-medium px-1.5 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-md border border-amber-500/20">
              PROMPT
            </span>
          </div>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Quick Search Toggle */}
        <button
          onClick={() => {
            setActiveTab('search');
          }}
          className={`p-2 rounded-xl transition-all active:scale-95 ${
            activeTab === 'search'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'bg-stone-200/70 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300'
          }`}
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Add New Button */}
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-700 to-amber-600 dark:from-amber-600 dark:to-amber-500 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-900/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{getAddLabel()}</span>
        </button>
      </div>
    </header>
  );
};

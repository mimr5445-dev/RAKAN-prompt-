/**
 * RAKAN Prompt - Root Level Sections Grid (Level 1 Drill-Down)
 * Displays executive section folders when no section is active.
 */

import React from 'react';
import { Plus, Pin, Heart, Edit2, Trash2, FolderOpen, ChevronRight, ChevronLeft, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SectionList: React.FC = () => {
  const {
    sections,
    categories,
    prompts,
    activeSectionId,
    setActiveSectionId,
    setActiveCategoryId,
    setActiveModal,
    setEditingSection,
    togglePinSection,
    toggleFavoriteSection,
    deleteSection,
    settings,
    t,
  } = useApp();

  // Hide SectionList entirely when we have drilled down into a section!
  if (activeSectionId) {
    return null;
  }

  const isRTL = settings.language === 'ar';
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  const handleOpenCreateSection = () => {
    setEditingSection(null);
    setActiveModal('create_section');
  };

  const handleOpenEditSection = (s: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSection(s);
    setActiveModal('edit_section');
  };

  const handleDeleteSection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t('deleteSectionConfirm'))) {
      deleteSection(id);
    }
  };

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    togglePinSection(id);
  };

  const handleToggleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteSection(id);
  };

  if (sections.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl shadow-inner mx-auto font-bold border border-amber-500/20">
          📁
        </div>
        <div className="space-y-1 max-w-xs">
          <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100">{t('emptySectionsTitle')}</h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">{t('emptySectionsSub')}</p>
        </div>
        <button
          onClick={handleOpenCreateSection}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-700 to-amber-600 text-white font-bold text-xs rounded-2xl shadow-lg shadow-amber-900/20 hover:brightness-110 active:scale-95 transition-all inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('createFirstSection')}</span>
        </button>
      </div>
    );
  }

  // Sort sections: Pinned first, then by order
  const sortedSections = [...sections].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return a.order - b.order;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-3.5">
      {/* Root Sections Title & Intro */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center font-extrabold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              {t('sections')}
            </h2>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              اختر قسماً للدخول إلى المجلدات والأوامر المحفوظة
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Section Vaults */}
      <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 pb-8 content-start">
        {sortedSections.map((sec) => {
          const catCount = categories.filter((c) => c.sectionId === sec.id).length;
          const promptCount = prompts.filter((p) => p.sectionId === sec.id && !p.isDeleted).length;

          return (
            <div
              key={sec.id}
              onClick={() => {
                setActiveSectionId(sec.id);
                setActiveCategoryId(null);
              }}
              className="group relative p-3.5 rounded-2xl bg-stone-100/90 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 hover:border-amber-500/50 dark:hover:border-amber-400/50 transition-all cursor-pointer flex flex-col justify-between min-h-[110px] shadow-sm hover:shadow-md"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center text-lg shadow-inner shrink-0">
                    📁
                  </span>
                  <span className="font-extrabold text-xs text-stone-900 dark:text-stone-100 line-clamp-2 leading-tight">
                    {sec.name}
                  </span>
                </div>

                {/* Status Badges & Quick Pin/Fav */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => handleTogglePin(sec.id, e)}
                    className={`p-1 rounded-md transition-opacity ${
                      sec.isPinned
                        ? 'text-amber-500 opacity-100'
                        : 'text-stone-400 opacity-0 group-hover:opacity-60 hover:opacity-100'
                    }`}
                    title={t('pin')}
                  >
                    <Pin className={`w-3.5 h-3.5 ${sec.isPinned ? 'fill-amber-500' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => handleToggleFav(sec.id, e)}
                    className={`p-1 rounded-md transition-opacity ${
                      sec.isFavorite
                        ? 'text-rose-500 opacity-100'
                        : 'text-stone-400 opacity-0 group-hover:opacity-60 hover:opacity-100'
                    }`}
                    title={t('favorite')}
                  >
                    <Heart className={`w-3.5 h-3.5 ${sec.isFavorite ? 'fill-rose-500' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-3 pt-2.5 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 font-bold">
                  <span>{catCount} مجلد</span>
                  <span className="text-stone-300 dark:text-stone-700">•</span>
                  <span>{promptCount} أمر</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleOpenEditSection(sec, e)}
                    className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 opacity-70 group-hover:opacity-100 transition-opacity"
                    title={t('editSection')}
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteSection(sec.id, e)}
                    className="p-1 rounded-lg hover:bg-red-500/10 text-stone-400 hover:text-red-500 opacity-60 group-hover:opacity-100 transition-opacity"
                    title={t('delete')}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

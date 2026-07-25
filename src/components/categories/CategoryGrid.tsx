/**
 * RAKAN Prompt - Section Categories Folder Grid (Level 2 Drill-Down)
 * Displays ONLY folders and section title when a section is active and no category is selected.
 */

import React from 'react';
import { Plus, Pin, Heart, Copy, Edit2, Trash2, FolderPlus, ChevronRight, ChevronLeft, ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Category } from '../../types';

export const CategoryGrid: React.FC = () => {
  const {
    sections,
    categories,
    activeSectionId,
    setActiveSectionId,
    activeCategoryId,
    setActiveCategoryId,
    prompts,
    setActiveModal,
    setEditingCategory,
    duplicateCategory,
    deleteCategory,
    togglePinCategory,
    toggleFavoriteCategory,
    settings,
    t,
  } = useApp();

  // Hide CategoryGrid if we are at Level 1 (no section) OR Level 3 (inside a category)!
  if (!activeSectionId || activeCategoryId) {
    return null;
  }

  const currentSection = sections.find((s) => s.id === activeSectionId);
  const isRTL = settings.language === 'ar';
  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  // Filter categories for the active section
  const sectionCategories = categories.filter((c) => c.sectionId === activeSectionId);

  // Sort: Pinned first, then order
  const sortedCategories = [...sectionCategories].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return a.order - b.order;
  });

  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setActiveModal('create_category');
  };

  const handleOpenEditCategory = (c: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategory(c);
    setActiveModal('edit_category');
  };

  const handleDuplicateCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateCategory(id);
  };

  const handleDeleteCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t('deleteCategoryConfirm'))) {
      deleteCategory(id);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-3.5">
      {/* Level 2 Sub-Header: Back to Sections & Section Title Only */}
      <div className="flex items-center justify-between pb-2.5 border-b border-stone-200 dark:border-stone-800 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveSectionId(null);
              setActiveCategoryId(null);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-500/20 active:scale-95 transition-all flex items-center gap-1 font-bold text-xs shadow-sm"
            title="العودة للأقسام الرئيسية"
          >
            <ArrowIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>الأقسام</span>
          </button>

          <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-0.5" />

          <div className="flex items-center gap-1.5">
            <span className="text-lg">📁</span>
            <h2 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 tracking-tight truncate max-w-[160px]">
              {currentSection?.name || t('categories')}
            </h2>
          </div>
        </div>

        <button
          onClick={handleOpenCreateCategory}
          className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-xl transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>مجلد جديد</span>
        </button>
      </div>

      {/* Categories Content Area */}
      {sectionCategories.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl shadow-inner mx-auto font-bold border border-amber-500/20">
            📂
          </div>
          <div className="space-y-1 max-w-xs">
            <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100">{t('emptyCategoriesTitle')}</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">{t('emptyCategoriesSub')}</p>
          </div>
          <button
            onClick={handleOpenCreateCategory}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-700 to-amber-600 text-white font-bold text-xs rounded-2xl shadow-lg shadow-amber-900/20 hover:brightness-110 active:scale-95 transition-all inline-flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            <span>{t('createFirstCategory')}</span>
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 pb-8 content-start">
          {sortedCategories.map((cat) => {
            const count = prompts.filter((p) => p.categoryId === cat.id && !p.isDeleted).length;

            return (
              <div
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className="group relative p-3.5 rounded-2xl bg-stone-100/90 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 hover:border-amber-500/50 dark:hover:border-amber-400/50 transition-all cursor-pointer flex flex-col justify-between min-h-[105px] shadow-sm hover:shadow-md"
                style={{
                  borderLeftColor: cat.color || '#D97706',
                  borderLeftWidth: '4px',
                }}
              >
                {/* Folder Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl leading-none">
                      {cat.icon && cat.icon.length <= 4 ? cat.icon : '📁'}
                    </span>
                    <span className="font-extrabold text-xs text-stone-900 dark:text-stone-100 line-clamp-2 leading-tight">
                      {cat.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
                    {cat.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    {cat.isFavorite && <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />}
                  </div>
                </div>

                {/* Folder Footer */}
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-200/60 dark:border-stone-800/60 text-[11px]">
                  <span className="font-bold text-stone-500 dark:text-stone-400">
                    {count} {t('prompts')}
                  </span>

                  {/* Folder Menu Actions */}
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleDuplicateCategory(cat.id, e)}
                      className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400"
                      title={t('duplicate')}
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleOpenEditCategory(cat, e)}
                      className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400"
                      title={t('editCategory')}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteCategory(cat.id, e)}
                      className="p-1 rounded hover:bg-red-500/10 text-stone-400 hover:text-red-500"
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
      )}
    </div>
  );
};

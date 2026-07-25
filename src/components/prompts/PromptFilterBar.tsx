/**
 * RAKAN Prompt - Prompts Filter, Sort & View Mode Toolbar
 */

import React from 'react';
import {
  LayoutGrid,
  Grid3X3,
  List,
  Square,
  Rows3,
  ArrowUpDown,
  Filter,
  Heart,
  Pin,
  Image as ImageIcon,
  Star,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ViewMode, SortOption } from '../../types';

export const PromptFilterBar: React.FC = () => {
  const { viewMode, setViewMode, sortOption, setSortOption, filter, setFilter, tags, t } = useApp();

  const viewModes: { id: ViewMode; icon: any; labelKey: string }[] = [
    { id: 'grid', icon: LayoutGrid, labelKey: 'viewGrid' },
    { id: 'compact', icon: Grid3X3, labelKey: 'viewCompact' },
    { id: 'list', icon: List, labelKey: 'viewList' },
    { id: 'large', icon: Square, labelKey: 'viewLarge' },
    { id: 'small', icon: Rows3, labelKey: 'viewSmall' },
  ];

  return (
    <div className="w-full px-4 py-2 space-y-2 shrink-0 border-b border-stone-200/60 dark:border-stone-800/60">
      {/* Top Toolbar Row */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {/* View Mode Selector Icons */}
        <div className="flex items-center gap-1 bg-stone-200/70 dark:bg-stone-800/80 p-1 rounded-xl shrink-0">
          {viewModes.map((m) => {
            const Icon = m.icon;
            const isActive = viewMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setViewMode(m.id)}
                className={`p-1.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-amber-700 text-white shadow-sm dark:bg-amber-600'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
                title={t(m.labelKey as any)}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>

        {/* Sort Option Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="px-2.5 py-1.5 rounded-xl bg-stone-200/70 dark:bg-stone-800/80 border-none font-bold text-[11px] text-stone-800 dark:text-stone-200 outline-none cursor-pointer"
          >
            <option value="newest">{t('sortNewest')}</option>
            <option value="oldest">{t('sortOldest')}</option>
            <option value="alphabetical">{t('sortAlphabetical')}</option>
            <option value="rating">{t('sortRating')}</option>
            <option value="most_used">{t('sortMostUsed')}</option>
          </select>
        </div>
      </div>

      {/* Filter Quick Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
        {/* Favorites Filter */}
        <button
          onClick={() => setFilter((prev) => ({ ...prev, favoritesOnly: !prev.favoritesOnly }))}
          className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shrink-0 transition-all border ${
            filter.favoritesOnly
              ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
              : 'bg-stone-200/50 dark:bg-stone-800/50 text-stone-600 dark:text-stone-400 border-stone-300/40 dark:border-stone-700/40'
          }`}
        >
          <Heart className="w-3 h-3 fill-current" />
          <span>{t('filterFavorites')}</span>
        </button>

        {/* Pinned Filter */}
        <button
          onClick={() => setFilter((prev) => ({ ...prev, pinnedOnly: !prev.pinnedOnly }))}
          className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shrink-0 transition-all border ${
            filter.pinnedOnly
              ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
              : 'bg-stone-200/50 dark:bg-stone-800/50 text-stone-600 dark:text-stone-400 border-stone-300/40 dark:border-stone-700/40'
          }`}
        >
          <Pin className="w-3 h-3 fill-current" />
          <span>{t('filterPinned')}</span>
        </button>

        {/* With Images Filter */}
        <button
          onClick={() =>
            setFilter((prev) => ({
              ...prev,
              withImagesOnly: !prev.withImagesOnly,
              withoutImagesOnly: false,
            }))
          }
          className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shrink-0 transition-all border ${
            filter.withImagesOnly
              ? 'bg-amber-700 text-white border-amber-800 shadow-sm'
              : 'bg-stone-200/50 dark:bg-stone-800/50 text-stone-600 dark:text-stone-400 border-stone-300/40 dark:border-stone-700/40'
          }`}
        >
          <ImageIcon className="w-3 h-3" />
          <span>{t('filterWithImages')}</span>
        </button>

        {/* Selected Tag Filter if active */}
        {filter.selectedTag && (
          <button
            onClick={() => setFilter((prev) => ({ ...prev, selectedTag: undefined }))}
            className="px-2.5 py-1 rounded-full font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 flex items-center gap-1 shrink-0"
          >
            <span>#{filter.selectedTag}</span>
            <span className="font-extrabold text-xs">×</span>
          </button>
        )}
      </div>
    </div>
  );
};

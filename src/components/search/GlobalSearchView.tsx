/**
 * RAKAN Prompt - Global Live Library Search View
 */

import React from 'react';
import { Search, X, Filter, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PromptCard } from '../prompts/PromptCard';

export const GlobalSearchView: React.FC = () => {
  const { filter, setFilter, filteredPrompts, t, viewMode } = useApp();

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-50 dark:bg-stone-900">
      {/* Search Input Header */}
      <div className="p-4 bg-stone-100 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 space-y-2">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={filter.searchQuery}
            onChange={(e) => setFilter((prev) => ({ ...prev, searchQuery: e.target.value }))}
            placeholder={t('searchPlaceholder')}
            autoFocus
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm"
          />
          {filter.searchQuery && (
            <button
              onClick={() => setFilter((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 font-bold px-1">
          <span>
            {t('globalSearch')}: {filteredPrompts.length} {t('prompts')}
          </span>
          {filter.selectedTag && (
            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-md">
              #{filter.selectedTag}
            </span>
          )}
        </div>
      </div>

      {/* Results Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {filteredPrompts.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xl mx-auto">
              🔍
            </div>
            <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">
              {t('noSearchResultsTitle')}
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
              {t('noSearchResultsSub')}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 gap-2.5'
                : viewMode === 'compact'
                ? 'grid grid-cols-3 gap-2'
                : 'space-y-2.5'
            }
          >
            {filteredPrompts.map((p) => (
              <PromptCard key={p.id} prompt={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

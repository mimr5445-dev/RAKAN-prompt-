/**
 * RAKAN Prompt - Favorites View
 */

import React from 'react';
import { Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PromptCard } from '../prompts/PromptCard';

export const FavoritesView: React.FC = () => {
  const { prompts, viewMode, t } = useApp();

  const favoritePrompts = prompts.filter((p) => p.isFavorite && !p.isDeleted);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-50 dark:bg-stone-900">
      {/* Header Banner */}
      <div className="p-4 bg-gradient-to-r from-rose-900/10 via-amber-900/10 to-transparent border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm">{t('tabFavorites')}</h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {favoritePrompts.length} {t('prompts')}
            </p>
          </div>
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        {favoritePrompts.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-2xl mx-auto">
              ❤️
            </div>
            <h4 className="font-bold text-sm text-stone-800 dark:text-stone-200">
              لا توجد عناصر مفضلة حالياً
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
              انقر على أيقونة القلب على أي أمر لتفضيله والوصول إليه بسرعة هنا.
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
            {favoritePrompts.map((p) => (
              <PromptCard key={p.id} prompt={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

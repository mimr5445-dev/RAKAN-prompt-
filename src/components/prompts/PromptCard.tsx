/**
 * RAKAN Prompt - Responsive Prompt Card Item
 * Supports 5 View Modes: grid, compact, list, large, small
 */

import React from 'react';
import { Copy, Heart, Pin, Star, Image as ImageIcon, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PromptItem } from '../../types';
import { ImageService } from '../../services/imageService';

interface PromptCardProps {
  prompt: PromptItem;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt }) => {
  const {
    viewMode,
    setSelectedPrompt,
    setActiveModal,
    copyToClipboard,
    toggleFavoritePrompt,
    togglePinPrompt,
    categories,
    t,
  } = useApp();

  const category = categories.find((c) => c.id === prompt.categoryId);
  const hasImage = prompt.images && prompt.images.length > 0;
  const imageSrc = hasImage
    ? prompt.images[0]
    : ImageService.createGraphicPlaceholder(prompt.title, category?.name || '');

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    copyToClipboard(prompt.prompt, prompt.title);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoritePrompt(prompt.id);
  };

  const handleOpenDetail = () => {
    setSelectedPrompt(prompt);
    setActiveModal('prompt_detail');
  };

  // --- VIEW MODE 1: COMPACT GRID (3 Columns) ---
  if (viewMode === 'compact') {
    return (
      <div
        onClick={handleOpenDetail}
        className="relative group rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 shadow-sm hover:border-amber-500/50 transition-all cursor-pointer flex flex-col justify-between aspect-square"
      >
        <img src={imageSrc} alt={prompt.title} className="w-full h-full object-cover" />

        {/* Overlay Banner */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 flex flex-col justify-between text-white">
          <div className="flex items-center justify-between">
            {prompt.isPinned && <Pin className="w-3 h-3 text-amber-400 fill-amber-400" />}
            <button
              onClick={handleFavorite}
              className="p-1 rounded-full bg-black/40 text-white hover:bg-rose-600 transition-colors"
            >
              <Heart
                className={`w-3 h-3 ${prompt.isFavorite ? 'text-rose-500 fill-rose-500' : ''}`}
              />
            </button>
          </div>

          <div className="flex items-end justify-between gap-1">
            <span className="font-bold text-[11px] truncate leading-tight">{prompt.title}</span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-500 active:scale-95 transition-all shrink-0"
              title={t('copy')}
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW MODE 2: SMALL CARDS ---
  if (viewMode === 'small') {
    return (
      <div
        onClick={handleOpenDetail}
        className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 hover:border-amber-500/50 transition-all cursor-pointer flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <img src={imageSrc} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-stone-800 dark:text-stone-100 truncate">
              {prompt.title}
            </h4>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
              {prompt.prompt}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleFavorite}
            className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors"
          >
            <Heart
              className={`w-3.5 h-3.5 ${prompt.isFavorite ? 'text-rose-500 fill-rose-500' : ''}`}
            />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-amber-700 dark:bg-amber-600 text-white hover:brightness-110 active:scale-95 transition-all"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW MODE 3: LIST VIEW ---
  if (viewMode === 'list') {
    return (
      <div
        onClick={handleOpenDetail}
        className="p-3 rounded-2xl bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 hover:border-amber-500/50 transition-all cursor-pointer flex items-start gap-3"
        style={{
          borderRightColor: prompt.colorLabel || 'transparent',
          borderRightWidth: prompt.colorLabel ? '4px' : '1px',
        }}
      >
        <img src={imageSrc} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-sm" />

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {prompt.emoji && <span className="text-xs">{prompt.emoji}</span>}
              <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                {prompt.title}
              </h4>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {prompt.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />}
              <button onClick={handleFavorite} className="p-1 text-stone-400 hover:text-rose-500">
                <Heart
                  className={`w-3.5 h-3.5 ${
                    prompt.isFavorite ? 'text-rose-500 fill-rose-500' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-stone-600 dark:text-stone-300 line-clamp-2 leading-snug font-mono bg-stone-200/50 dark:bg-stone-900/50 p-1.5 rounded-lg border border-stone-200/40 dark:border-stone-800/40">
            {prompt.prompt}
          </p>

          <div className="flex items-center justify-between pt-1 text-[10px]">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-500" />
              <span>{prompt.rating || 5}</span>
            </div>

            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg bg-amber-700 dark:bg-amber-600 text-white font-bold flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all"
            >
              <Copy className="w-3 h-3" />
              <span>{t('copy')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW MODE 4: LARGE CARDS ---
  if (viewMode === 'large') {
    return (
      <div
        onClick={handleOpenDetail}
        className="rounded-3xl overflow-hidden bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 shadow-md hover:border-amber-500/50 transition-all cursor-pointer flex flex-col space-y-2 p-3"
      >
        <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-black/10">
          <img src={imageSrc} alt="" className="w-full h-full object-cover" />
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            <button
              onClick={handleFavorite}
              className="p-2 rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-rose-600 transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${prompt.isFavorite ? 'text-rose-500 fill-rose-500' : ''}`}
              />
            </button>
          </div>
          {prompt.isPinned && (
            <div className="absolute top-2.5 left-2.5 p-1.5 rounded-full bg-amber-500 text-stone-900 font-bold shadow-md">
              <Pin className="w-3.5 h-3.5 fill-current" />
            </div>
          )}
        </div>

        <div className="space-y-1.5 px-1">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 truncate">
              {prompt.title}
            </h4>
            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span>{prompt.rating || 5}</span>
            </div>
          </div>

          <p className="text-xs text-stone-700 dark:text-stone-300 line-clamp-3 font-mono bg-stone-200/60 dark:bg-stone-900/60 p-2.5 rounded-xl border border-stone-200/50 dark:border-stone-800/50">
            {prompt.prompt}
          </p>

          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-wrap gap-1">
              {prompt.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-600 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-900/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{t('copy')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- DEFAULT VIEW MODE: GRID (2 Columns) ---
  return (
    <div
      onClick={handleOpenDetail}
      className="rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 shadow-sm hover:border-amber-500/50 transition-all cursor-pointer flex flex-col justify-between"
      style={{
        borderTopColor: prompt.colorLabel || 'transparent',
        borderTopWidth: prompt.colorLabel ? '3px' : '1px',
      }}
    >
      <div className="relative w-full h-32 bg-stone-200 dark:bg-stone-800 overflow-hidden">
        <img src={imageSrc} alt="" className="w-full h-full object-cover" />

        <div className="absolute top-2 right-2 flex items-center gap-1">
          <button
            onClick={handleFavorite}
            className="p-1.5 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-rose-600 transition-colors"
          >
            <Heart
              className={`w-3.5 h-3.5 ${prompt.isFavorite ? 'text-rose-500 fill-rose-500' : ''}`}
            />
          </button>
        </div>

        {prompt.isPinned && (
          <div className="absolute top-2 left-2 p-1 rounded-full bg-amber-500 text-stone-900 shadow-md">
            <Pin className="w-3 h-3 fill-current" />
          </div>
        )}
      </div>

      <div className="p-2.5 space-y-1.5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
            {prompt.title}
          </h4>
          <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2 mt-0.5 leading-snug">
            {prompt.prompt}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-stone-200/50 dark:border-stone-800/50 text-[10px]">
          <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-current" />
            <span>{prompt.rating || 5}</span>
          </span>

          <button
            onClick={handleCopy}
            className="px-2.5 py-1 bg-amber-700 dark:bg-amber-600 text-white font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            <span>{t('copy')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * RAKAN Prompt - Detailed Prompt Sheet & Version Viewer Modal
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Copy,
  Heart,
  Pin,
  Star,
  Edit3,
  Trash2,
  Maximize2,
  History,
  RotateCcw,
  Tag as TagIcon,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ImageZoomModal } from '../ui/ImageZoomModal';
import { PromptVersion } from '../../types';

export const PromptDetailModal: React.FC = () => {
  const {
    selectedPrompt,
    setSelectedPrompt,
    activeModal,
    setActiveModal,
    setEditingPrompt,
    deletePrompt,
    copyToClipboard,
    toggleFavoritePrompt,
    togglePinPrompt,
    restorePromptVersion,
    setFilter,
    t,
  } = useApp();

  const isOpen = activeModal === 'prompt_detail' && selectedPrompt !== null;

  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  if (!isOpen || !selectedPrompt) return null;

  const handleCopyPrompt = () => {
    copyToClipboard(selectedPrompt.prompt, selectedPrompt.title);
  };

  const handleCopyNegativePrompt = () => {
    copyToClipboard(selectedPrompt.negativePrompt, 'Negative Prompt');
  };

  const handleEdit = () => {
    setEditingPrompt(selectedPrompt);
    setActiveModal('edit_prompt');
  };

  const handleDelete = () => {
    if (window.confirm(t('deletePromptConfirm'))) {
      deletePrompt(selectedPrompt.id);
      setActiveModal(null);
    }
  };

  const handleTagClick = (tag: string) => {
    setFilter((prev) => ({ ...prev, selectedTag: tag }));
    setActiveModal(null);
  };

  const images = selectedPrompt.images || [];
  const versions = selectedPrompt.versions || [];

  return (
    <>
      <AnimatePresence>
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-full max-w-md bg-stone-100 dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 max-h-[92vh] flex flex-col overflow-hidden"
          >
            {/* Modal Header Bar */}
            <div className="p-4 bg-stone-200/60 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                {selectedPrompt.emoji && <span className="text-xl">{selectedPrompt.emoji}</span>}
                <h3 className="font-bold text-sm truncate">{selectedPrompt.title}</h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => togglePinPrompt(selectedPrompt.id)}
                  className={`p-1.5 rounded-xl transition-colors ${
                    selectedPrompt.isPinned
                      ? 'bg-amber-500 text-stone-900'
                      : 'bg-stone-300 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                  }`}
                  title={t('pin')}
                >
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleFavoritePrompt(selectedPrompt.id)}
                  className={`p-1.5 rounded-xl transition-colors ${
                    selectedPrompt.isFavorite
                      ? 'bg-rose-500 text-white'
                      : 'bg-stone-300 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                  }`}
                  title={t('favorite')}
                >
                  <Heart className="w-4 h-4" />
                </button>
                <button
                  onClick={handleEdit}
                  className="p-1.5 rounded-xl bg-amber-700 text-white hover:brightness-110"
                  title={t('edit')}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-full hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-500 ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              {/* Images Carousel Preview */}
              {images.length > 0 && (
                <div className="relative group rounded-2xl overflow-hidden bg-black/20 border border-stone-300 dark:border-stone-800">
                  <img
                    src={images[selectedImageIndex] || images[0]}
                    alt=""
                    className="w-full h-56 object-contain bg-stone-950"
                  />
                  <button
                    onClick={() => setIsZoomOpen(true)}
                    className="absolute top-2 right-2 p-2 rounded-xl bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-all"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>

                  {/* Thumbnail Row */}
                  {images.length > 1 && (
                    <div className="p-2 flex gap-2 overflow-x-auto bg-stone-900/80">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`w-10 h-10 rounded-lg overflow-hidden border-2 shrink-0 ${
                            idx === selectedImageIndex ? 'border-amber-500 scale-105' : 'border-transparent opacity-60'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Main Prompt Code Block */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[11px]">
                    {t('promptContent')}
                  </span>
                  <button
                    onClick={handleCopyPrompt}
                    className="px-3 py-1 bg-gradient-to-r from-amber-700 to-amber-600 text-white font-bold rounded-xl shadow-md shadow-amber-900/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t('copy')}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-900 text-amber-300 dark:bg-stone-950 dark:text-amber-200 font-mono text-xs leading-relaxed border border-stone-800 shadow-inner select-all whitespace-pre-wrap break-words">
                  {selectedPrompt.prompt}
                </div>
              </div>

              {/* Negative Prompt Code Block if present */}
              {selectedPrompt.negativePrompt && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[11px]">
                      {t('negativePrompt')}
                    </span>
                    <button
                      onClick={handleCopyNegativePrompt}
                      className="px-3 py-1 bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold rounded-xl hover:bg-stone-300 dark:hover:bg-stone-700 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t('copy')}</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-900/90 text-rose-300 dark:bg-stone-950 dark:text-rose-200 font-mono text-xs leading-relaxed border border-stone-800 shadow-inner select-all whitespace-pre-wrap break-words">
                    {selectedPrompt.negativePrompt}
                  </div>
                </div>
              )}

              {/* Notes & Checklists */}
              {selectedPrompt.notes && (
                <div className="space-y-1.5">
                  <span className="font-extrabold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[11px]">
                    {t('notes')}
                  </span>
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 leading-relaxed whitespace-pre-wrap">
                    {selectedPrompt.notes}
                  </div>
                </div>
              )}

              {/* Clickable Tags */}
              {selectedPrompt.tags && selectedPrompt.tags.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-extrabold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[11px]">
                    {t('tags')}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPrompt.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className="px-2.5 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold rounded-lg border border-amber-500/20 hover:bg-amber-500/20 transition-colors flex items-center gap-1"
                      >
                        <TagIcon className="w-3 h-3" />
                        <span>#{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Version History Sheet Trigger */}
              {versions.length > 0 && (
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
                  <button
                    onClick={() => setShowVersionHistory(!showVersionHistory)}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4" />
                      <span>
                        {t('versionHistory')} ({versions.length})
                      </span>
                    </div>
                    <span className="text-[10px] underline">
                      {showVersionHistory ? t('close') : t('show')}
                    </span>
                  </button>

                  {/* Versions List */}
                  {showVersionHistory && (
                    <div className="mt-2 space-y-2 p-3 bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700">
                      {versions.map((ver) => (
                        <div
                          key={ver.id}
                          className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px] text-stone-500">
                            <span>
                              الإصدار #{ver.versionNumber} •{' '}
                              {new Date(ver.timestamp).toLocaleDateString('ar-SA')}
                            </span>
                            <button
                              onClick={() => restorePromptVersion(selectedPrompt.id, ver)}
                              className="px-2 py-0.5 bg-amber-600 text-white font-bold rounded-md hover:bg-amber-500 flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>{t('restoreVersion')}</span>
                            </button>
                          </div>
                          <p className="font-mono text-[11px] text-stone-700 dark:text-stone-300 line-clamp-2">
                            {ver.prompt}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-3 bg-stone-200/60 dark:bg-stone-800/80 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0">
              <button
                onClick={handleDelete}
                className="p-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 font-bold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('delete')}</span>
              </button>

              <button
                onClick={handleCopyPrompt}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-700 to-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                <span>{t('copy')}</span>
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Fullscreen Image Zoom Gallery */}
      <ImageZoomModal
        images={images}
        initialIndex={selectedImageIndex}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
      />
    </>
  );
};

/**
 * RAKAN Prompt - Create/Edit Section Modal
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Layers, Pin, Heart, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SectionModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    editingSection,
    createSection,
    updateSection,
    deleteSection,
    t,
  } = useApp();

  const isEditing = activeModal === 'edit_section' && editingSection !== null;
  const isOpen = activeModal === 'create_section' || activeModal === 'edit_section';

  const [name, setName] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (isEditing && editingSection) {
      setName(editingSection.name);
      setIsPinned(editingSection.isPinned || false);
      setIsFavorite(editingSection.isFavorite || false);
    } else {
      setName('');
      setIsPinned(false);
      setIsFavorite(false);
    }
  }, [isEditing, editingSection, activeModal]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing && editingSection) {
      await updateSection({
        ...editingSection,
        name: name.trim(),
        isPinned,
        isFavorite,
      });
    } else {
      const created = await createSection(name.trim());
      if (isPinned || isFavorite) {
        await updateSection({
          ...created,
          isPinned,
          isFavorite,
        });
      }
    }

    setActiveModal(null);
  };

  const handleDelete = async () => {
    if (editingSection && window.confirm(t('deleteSectionConfirm'))) {
      await deleteSection(editingSection.id);
      setActiveModal(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-full max-w-md bg-stone-100 dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">
                {isEditing ? t('editSection') : t('createSection')}
              </h3>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 mb-1">
                {t('sectionName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: مكتبة صور الذكاء الاصطناعي، العبارات العامة..."
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
            </div>

            {/* Quick Toggles */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all mr-1.5 ${
                  isPinned
                    ? 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300'
                    : 'bg-stone-200/50 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                <Pin className="w-3.5 h-3.5" />
                <span>{t('pin')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ml-1.5 ${
                  isFavorite
                    ? 'bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300'
                    : 'bg-stone-200/50 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>{t('favorite')}</span>
              </button>
            </div>

            {/* Submit & Delete Buttons */}
            <div className="flex items-center gap-2 pt-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
                  title={t('delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                disabled={!name.trim()}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-700 to-amber-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-900/20 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all text-center"
              >
                {t('save')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

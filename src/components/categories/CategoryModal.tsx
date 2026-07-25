/**
 * RAKAN Prompt - Create & Edit Category Modal
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Folder, Pin, Heart, Trash2, Palette } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CATEGORY_EMOJIS, LABEL_COLORS } from '../../theme/colors';

export const CategoryModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    editingCategory,
    sections,
    activeSectionId,
    createCategory,
    updateCategory,
    deleteCategory,
    t,
  } = useApp();

  const isEditing = activeModal === 'edit_category' && editingCategory !== null;
  const isOpen = activeModal === 'create_category' || activeModal === 'edit_category';

  const [name, setName] = useState('');
  const [sectionId, setSectionId] = useState(activeSectionId || '');
  const [icon, setIcon] = useState('🖼️');
  const [color, setColor] = useState(LABEL_COLORS[2]); // Amber default
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (isEditing && editingCategory) {
      setName(editingCategory.name);
      setSectionId(editingCategory.sectionId);
      setIcon(editingCategory.icon || '🖼️');
      setColor(editingCategory.color || LABEL_COLORS[2]);
      setIsPinned(editingCategory.isPinned || false);
      setIsFavorite(editingCategory.isFavorite || false);
    } else {
      setName('');
      setSectionId(activeSectionId || (sections[0]?.id || ''));
      setIcon('🖼️');
      setColor(LABEL_COLORS[2]);
      setIsPinned(false);
      setIsFavorite(false);
    }
  }, [isEditing, editingCategory, activeModal, activeSectionId, sections]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sectionId) return;

    if (isEditing && editingCategory) {
      await updateCategory({
        ...editingCategory,
        sectionId,
        name: name.trim(),
        icon,
        color,
        isPinned,
        isFavorite,
      });
    } else {
      await createCategory({
        sectionId,
        name: name.trim(),
        icon,
        color,
        isPinned,
        isFavorite,
      });
    }

    setActiveModal(null);
  };

  const handleDelete = async () => {
    if (editingCategory && window.confirm(t('deleteCategoryConfirm'))) {
      await deleteCategory(editingCategory.id);
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
          className="w-full max-w-md bg-stone-100 dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
                <Folder className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">
                {isEditing ? t('editCategory') : t('createCategory')}
              </h3>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Target Section Selection */}
            <div>
              <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">
                {t('selectSection')}
              </label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Name Input */}
            <div>
              <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">
                {t('categoryName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="بورتريه، 3D، أنمي، تصوير ضوئي، معماري..."
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Icon/Emoji Picker */}
            <div>
              <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">
                {t('chooseIcon')}
              </label>
              <div className="flex flex-wrap gap-2 p-2 rounded-2xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 max-h-28 overflow-y-auto">
                {CATEGORY_EMOJIS.map((e) => (
                  <button
                    type="button"
                    key={e}
                    onClick={() => setIcon(e)}
                    className={`p-2 text-lg rounded-xl transition-transform ${
                      icon === e ? 'bg-amber-500/20 ring-2 ring-amber-500 scale-110' : 'hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Accent Picker */}
            <div>
              <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">
                {t('chooseColor')}
              </label>
              <div className="flex items-center gap-2 overflow-x-auto p-1">
                {LABEL_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full shrink-0 border-2 transition-transform ${
                      color === c ? 'border-amber-500 scale-115 shadow-md' : 'border-transparent opacity-80'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Quick Pin / Favorite Toggles */}
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

            {/* Action Buttons */}
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
                disabled={!name.trim() || !sectionId}
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

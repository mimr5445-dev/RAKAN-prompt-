/**
 * RAKAN Prompt - Trash & Recycle Bin Modal View
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TrashView: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    prompts,
    restorePrompt,
    deletePromptPermanently,
    emptyTrash,
    t,
  } = useApp();

  const isOpen = activeModal === 'trash_bin';
  if (!isOpen) return null;

  const deletedPrompts = prompts.filter((p) => p.isDeleted);

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-full max-w-md bg-stone-100 dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 max-h-[88vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">{t('trash')}</h3>
                <p className="text-[10px] text-stone-500">{t('trashDescription')}</p>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-2 overflow-y-auto space-y-2 my-2 text-xs">
            {deletedPrompts.length === 0 ? (
              <div className="py-12 text-center text-stone-400 space-y-2">
                <Trash2 className="w-8 h-8 mx-auto opacity-40" />
                <p className="font-bold">{t('trashIsEmpty')}</p>
              </div>
            ) : (
              deletedPrompts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs truncate">{p.title}</h4>
                    <p className="text-[10px] text-stone-500 truncate">{p.prompt}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => restorePrompt(p.id)}
                      className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold hover:bg-amber-500/20 flex items-center gap-1"
                      title={t('restore')}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('restore')}</span>
                    </button>

                    <button
                      onClick={() => deletePromptPermanently(p.id)}
                      className="p-2 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20"
                      title={t('deleteForever')}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {deletedPrompts.length > 0 && (
            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 shrink-0">
              <button
                onClick={() => {
                  if (window.confirm(t('emptyTrashConfirm'))) {
                    emptyTrash();
                  }
                }}
                className="w-full py-2.5 px-4 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('emptyTrash')}</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

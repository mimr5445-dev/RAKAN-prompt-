/**
 * RAKAN Prompt - Library Statistics Modal Dashboard
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BarChart3, Layers, Folder, Sparkles, Image, Heart, Pin, HardDrive } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StatsView: React.FC = () => {
  const { activeModal, setActiveModal, stats, t } = useApp();

  const isOpen = activeModal === 'stats_dashboard';
  if (!isOpen) return null;

  const statItems = [
    { label: t('statPrompts'), value: stats.totalPrompts, icon: Sparkles, color: 'text-amber-500' },
    { label: t('statSections'), value: stats.totalSections, icon: Layers, color: 'text-amber-600' },
    { label: t('statCategories'), value: stats.totalCategories, icon: Folder, color: 'text-blue-500' },
    { label: t('statImages'), value: stats.totalImages, icon: Image, color: 'text-emerald-500' },
    { label: t('statFavorites'), value: stats.totalFavorites, icon: Heart, color: 'text-rose-500' },
    { label: t('statPinned'), value: stats.totalPinned, icon: Pin, color: 'text-purple-500' },
  ];

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-full max-w-md bg-stone-100 dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 max-h-[88vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm">{t('statistics')}</h3>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs mb-4">
            {statItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center gap-3"
                >
                  <div className={`p-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold">{item.value}</div>
                    <div className="text-[10px] text-stone-500 dark:text-stone-400">{item.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Storage Meter Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-900/10 via-amber-800/10 to-transparent border border-amber-500/20 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <HardDrive className="w-4 h-4" />
                <span>{t('statStorage')}</span>
              </span>
              <span className="font-extrabold text-amber-600">{stats.estimatedSizeMB} MB</span>
            </div>

            <div className="w-full h-2 rounded-full bg-stone-300 dark:bg-stone-700 overflow-hidden">
              <div
                className="h-full bg-amber-600 rounded-full"
                style={{ width: `${Math.min(100, (stats.estimatedSizeMB / 50) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">
              يتم التخزين محلياً على جهازك بواسطة محرك IndexedDB فائق السرعة.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

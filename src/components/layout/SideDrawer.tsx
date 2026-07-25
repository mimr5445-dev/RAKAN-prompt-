/**
 * RAKAN Prompt - iOS Native Side Drawer Navigation
 * Slides strictly inside the mobile screen container bounds
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Layers,
  Trash2,
  HardDrive,
  BarChart3,
  Lock,
  Palette,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Globe,
  Heart,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SideDrawer: React.FC = () => {
  const {
    isSideDrawerOpen,
    setIsSideDrawerOpen,
    t,
    setActiveModal,
    setActiveTab,
    setActiveSectionId,
    setActiveCategoryId,
    stats,
    prompts,
    settings,
    updateSettings,
    resetApplication,
  } = useApp();

  if (!isSideDrawerOpen) return null;

  const deletedCount = prompts.filter((p) => p.isDeleted).length;
  const isRTL = settings.language === 'ar';
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  const handleOpenModal = (modalName: any) => {
    setIsSideDrawerOpen(false);
    setActiveModal(modalName);
  };

  const handleSelectTab = (tabName: any) => {
    if (tabName === 'home') {
      setActiveSectionId(null);
      setActiveCategoryId(null);
    }
    setIsSideDrawerOpen(false);
    setActiveTab(tabName);
  };

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 overflow-hidden">
        {/* Backdrop overlay strictly inside mobile shell */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSideDrawerOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Drawer panel sliding from right in RTL, or left in LTR */}
        <motion.aside
          initial={{ x: isRTL ? '100%' : '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: isRTL ? '100%' : '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className={`absolute top-0 bottom-0 ${
            isRTL ? 'right-0' : 'left-0'
          } w-[82%] max-w-[320px] bg-stone-100 dark:bg-stone-900 border-l border-r border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col justify-between overflow-y-auto text-stone-900 dark:text-stone-100 z-50`}
        >
          {/* Drawer Header */}
          <div className="p-5 bg-gradient-to-br from-amber-900/10 via-amber-800/5 to-transparent border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-amber-900/30">
                R
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-sm tracking-tight text-amber-950 dark:text-amber-300">
                  {t('appName')}
                </h3>
                <span className="text-[10px] text-stone-500 dark:text-stone-400">
                  {t('version')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsSideDrawerOpen(false)}
              className="p-1.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-amber-500/20"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Stats Banner */}
          <div className="px-4 py-3 mx-4 my-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-around text-center">
            <div>
              <div className="text-base font-extrabold text-amber-700 dark:text-amber-400">
                {stats.totalPrompts}
              </div>
              <div className="text-[10px] text-stone-500 dark:text-stone-400">{t('prompts')}</div>
            </div>
            <div className="h-6 w-px bg-amber-500/20" />
            <div>
              <div className="text-base font-extrabold text-amber-700 dark:text-amber-400">
                {stats.totalSections}
              </div>
              <div className="text-[10px] text-stone-500 dark:text-stone-400">{t('sections')}</div>
            </div>
            <div className="h-6 w-px bg-amber-500/20" />
            <div>
              <div className="text-base font-extrabold text-amber-700 dark:text-amber-400">
                {stats.totalCategories}
              </div>
              <div className="text-[10px] text-stone-500 dark:text-stone-400">{t('categories')}</div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 px-3 py-2 space-y-1 text-xs">
            {/* Sections & Navigation */}
            <button
              onClick={() => handleSelectTab('home')}
              className="w-full p-3 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 flex items-center justify-between transition-colors text-stone-800 dark:text-stone-200 font-medium"
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{t('sections')}</span>
              </div>
              <ArrowIcon className="w-4 h-4 text-stone-400" />
            </button>

            {/* Favorites */}
            <button
              onClick={() => handleSelectTab('favorites')}
              className="w-full p-3 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 flex items-center justify-between transition-colors text-stone-800 dark:text-stone-200 font-medium"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>{t('tabFavorites')}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-500/10 text-rose-600 rounded-full">
                {stats.totalFavorites}
              </span>
            </button>

            {/* Backup & Import/Export */}
            <button
              onClick={() => handleOpenModal('backup_manager')}
              className="w-full p-3 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 flex items-center justify-between transition-colors text-stone-800 dark:text-stone-200 font-medium"
            >
              <div className="flex items-center gap-3">
                <HardDrive className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{t('backupAndExport')}</span>
              </div>
              <ArrowIcon className="w-4 h-4 text-stone-400" />
            </button>

            {/* Library Statistics */}
            <button
              onClick={() => handleOpenModal('stats_dashboard')}
              className="w-full p-3 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 flex items-center justify-between transition-colors text-stone-800 dark:text-stone-200 font-medium"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('statistics')}</span>
              </div>
              <ArrowIcon className="w-4 h-4 text-stone-400" />
            </button>

            {/* Trash Bin */}
            <button
              onClick={() => handleOpenModal('trash_bin')}
              className="w-full p-3 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 flex items-center justify-between transition-colors text-stone-800 dark:text-stone-200 font-medium"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-amber-700 dark:text-amber-500" />
                <span>{t('trash')}</span>
              </div>
              {deletedCount > 0 ? (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-600 text-white rounded-full">
                  {deletedCount}
                </span>
              ) : (
                <ArrowIcon className="w-4 h-4 text-stone-400" />
              )}
            </button>

            <div className="my-2 border-t border-stone-200 dark:border-stone-800" />

            {/* Appearance Settings */}
            <button
              onClick={() => handleSelectTab('settings')}
              className="w-full p-3 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 flex items-center justify-between transition-colors text-stone-800 dark:text-stone-200 font-medium"
            >
              <div className="flex items-center gap-3">
                <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{t('settings')}</span>
              </div>
              <ArrowIcon className="w-4 h-4 text-stone-400" />
            </button>

            {/* Language Quick Switch */}
            <button
              onClick={() => {
                updateSettings({ language: settings.language === 'ar' ? 'en' : 'ar' });
              }}
              className="w-full p-3 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 flex items-center justify-between transition-colors text-stone-800 dark:text-stone-200 font-medium"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>{t('language')}</span>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 bg-stone-200 dark:bg-stone-800 rounded-md">
                {settings.language === 'ar' ? 'العربية' : 'English'}
              </span>
            </button>

            {/* PIN Security Toggle */}
            <button
              onClick={() => handleOpenModal('pin_lock')}
              className="w-full p-3 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800/60 flex items-center justify-between transition-colors text-stone-800 dark:text-stone-200 font-medium"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{t('securityLock')}</span>
              </div>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  settings.isSecurityEnabled
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                }`}
              >
                {settings.isSecurityEnabled ? 'مفعّل' : 'معطّل'}
              </span>
            </button>
          </div>

          {/* Drawer Footer & Reset App Option */}
          <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-200/40 dark:bg-stone-950/40 space-y-2">
            <button
              onClick={() => {
                if (window.confirm(t('resetAppConfirm'))) {
                  resetApplication();
                  setIsSideDrawerOpen(false);
                }
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('resetApp')}</span>
            </button>

            <p className="text-[10px] text-center text-stone-400 dark:text-stone-500">
              RAKAN Prompt v2.5.0 Pro • Offline Storage Engine
            </p>
          </div>
        </motion.aside>
      </div>
    </AnimatePresence>
  );
};

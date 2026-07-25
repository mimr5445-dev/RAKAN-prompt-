/**
 * RAKAN Prompt - Backup, Export & Smart Import Modal
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HardDrive, Download, Upload, FileJson, Archive, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BackupService } from '../../services/backupService';
import { dbEngine } from '../../db/indexedDB';

export const BackupModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    sections,
    categories,
    prompts,
    tags,
    showToast,
    t,
  } = useApp();

  const isOpen = activeModal === 'backup_manager';

  const [exportFormat, setExportFormat] = useState<'json' | 'zip'>('zip');
  const [exportScope, setExportScope] = useState<'all' | 'favorites'>('all');
  const [importOption, setImportOption] = useState<'merge' | 'replace' | 'new_section'>('merge');
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsProcessing(true);
    try {
      const exportPrompts = exportScope === 'favorites' ? prompts.filter((p) => p.isFavorite) : prompts;

      const data = {
        sections,
        categories,
        prompts: exportPrompts,
        tags,
      };

      if (exportFormat === 'zip') {
        await BackupService.exportZIP(data);
      } else {
        BackupService.exportJSON(data);
      }

      showToast(t('backupCreated'));
    } catch (err) {
      console.error('Export error:', err);
      showToast(t('toastError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    try {
      const backupData = await BackupService.parseImportFile(files[0]);

      if (importOption === 'replace') {
        await dbEngine.clearAllData();
      }

      // Existing hashes for duplicate detection
      const existingHashes = new Set(
        importOption === 'replace' ? [] : prompts.map((p) => BackupService.computePromptHash(p.title, p.prompt))
      );

      // Restore sections
      for (const sec of backupData.sections || []) {
        await dbEngine.saveSection(sec);
      }

      // Restore categories
      for (const cat of backupData.categories || []) {
        await dbEngine.saveCategory(cat);
      }

      // Restore tags
      for (const tag of backupData.tags || []) {
        await dbEngine.saveTag(tag);
      }

      // Restore prompts with intelligent duplicate skipping
      let importedCount = 0;
      for (const p of backupData.prompts || []) {
        const hash = BackupService.computePromptHash(p.title, p.prompt);
        if (skipDuplicates && existingHashes.has(hash)) {
          continue;
        }

        await dbEngine.savePrompt(p);
        existingHashes.add(hash);
        importedCount++;
      }

      showToast(`${t('backupRestored')} (${importedCount} عناصر)`);

      // Reload page state
      window.location.reload();
    } catch (err: any) {
      console.error('Import error:', err);
      alert(`فشل الاستيراد: ${err.message || 'خطأ في الملف'}`);
    } finally {
      setIsProcessing(false);
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
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm">{t('backupAndExport')}</h3>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5 text-xs">
            {/* EXPORT SECTION */}
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-3">
              <div className="flex items-center gap-2 font-extrabold text-amber-800 dark:text-amber-300">
                <Download className="w-4 h-4" />
                <span>{t('exportLibrary')}</span>
              </div>

              {/* Export Format Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExportFormat('zip')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                    exportFormat === 'zip'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-md'
                      : 'bg-stone-100 dark:bg-stone-900 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  <Archive className="w-4 h-4" />
                  <span>ZIP (مع الصور)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExportFormat('json')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                    exportFormat === 'json'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-md'
                      : 'bg-stone-100 dark:bg-stone-900 border-stone-300 dark:border-stone-700'
                  }`}
                >
                  <FileJson className="w-4 h-4" />
                  <span>JSON (بيانات فقط)</span>
                </button>
              </div>

              <button
                onClick={handleExport}
                disabled={isProcessing}
                className="w-full py-2.5 bg-gradient-to-r from-amber-700 to-amber-600 text-white font-extrabold rounded-xl shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? 'جاري التصدير...' : t('exportLibrary')}
              </button>
            </div>

            {/* IMPORT SECTION */}
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-3">
              <div className="flex items-center gap-2 font-extrabold text-amber-800 dark:text-amber-300">
                <Upload className="w-4 h-4" />
                <span>{t('importLibrary')}</span>
              </div>

              {/* Import Options */}
              <div className="space-y-1.5">
                <label className="block font-bold text-stone-600 dark:text-stone-400">
                  {t('importOptions')}
                </label>
                <select
                  value={importOption}
                  onChange={(e) => setImportOption(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-bold"
                >
                  <option value="merge">{t('importMerge')}</option>
                  <option value="replace">{t('importReplace')}</option>
                </select>
              </div>

              {/* Skip Duplicates Toggle */}
              <label className="flex items-center gap-2 cursor-pointer pt-1 font-bold">
                <input
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                />
                <span>{t('importSkipDuplicates')}</span>
              </label>

              {/* Upload Input Button */}
              <label className="flex items-center justify-center w-full py-3 bg-stone-900 text-amber-300 font-extrabold rounded-xl cursor-pointer hover:bg-stone-800 active:scale-95 transition-all text-center">
                <span>اختر ملف (.ZIP أو .JSON) للاستيراد</span>
                <input
                  type="file"
                  accept=".json,.zip"
                  onChange={handleImportFile}
                  disabled={isProcessing}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

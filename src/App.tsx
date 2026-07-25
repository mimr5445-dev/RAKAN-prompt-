/**
 * RAKAN Prompt - Main Application Entry
 * Full Native Mobile Shell with Modular Tab Views & Overlays
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MobileShell } from './components/layout/MobileShell';
import { Header } from './components/layout/Header';
import { TabBar } from './components/layout/TabBar';
import { SideDrawer } from './components/layout/SideDrawer';
import { Toast } from './components/ui/Toast';

// Home Views & Prompts
import { SectionList } from './components/sections/SectionList';
import { CategoryGrid } from './components/categories/CategoryGrid';
import { PromptFilterBar } from './components/prompts/PromptFilterBar';
import { PromptCard } from './components/prompts/PromptCard';

// Specialized Tab Views
import { GlobalSearchView } from './components/search/GlobalSearchView';
import { FavoritesView } from './components/favorites/FavoritesView';
import { TagManagerView } from './components/tags/TagManagerView';
import { SettingsView } from './components/settings/SettingsView';

// Modals & Overlays
import { SectionModal } from './components/sections/SectionModal';
import { CategoryModal } from './components/categories/CategoryModal';
import { PromptDetailModal } from './components/prompts/PromptDetailModal';
import { PromptEditorModal } from './components/prompts/PromptEditorModal';
import { TrashView } from './components/trash/TrashView';
import { StatsView } from './components/stats/StatsView';
import { BackupModal } from './components/backup/BackupModal';
import { SecurityLockOverlay } from './components/security/SecurityLockOverlay';
import { Plus, Sparkles, FolderOpen, ArrowRight, ArrowLeft } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    filteredPrompts,
    viewMode,
    categories,
    activeCategoryId,
    activeSectionId,
    setActiveCategoryId,
    setActiveModal,
    settings,
    setEditingPrompt,
    t,
  } = useApp();

  const currentCat = categories.find((c) => c.id === activeCategoryId);
  const isRTL = settings.language === 'ar';
  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <MobileShell>
      <div className="w-full h-full flex-1 flex flex-col overflow-hidden bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 select-none">
        {/* Sticky Mobile Header */}
        <Header />

        {/* Tab Views */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'home' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Level 1: Horizontal Section List / Grid (renders only when !activeSectionId) */}
              <SectionList />

              {/* Level 2: Category Cards Grid (renders only when activeSectionId && !activeCategoryId) */}
              <CategoryGrid />

              {/* Level 3: Prompts List inside Selected Category (renders only when activeSectionId && activeCategoryId) */}
              {activeSectionId && activeCategoryId && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Level 3 Sub-Header: Back to Folders & Category Title Only */}
                  <div className="flex items-center justify-between pb-2.5 px-4 pt-2 border-b border-stone-200 dark:border-stone-800 shrink-0 bg-stone-100/40 dark:bg-stone-900/40">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveCategoryId(null)}
                        className="px-2.5 py-1.5 rounded-xl bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-500/20 active:scale-95 transition-all flex items-center gap-1 font-bold text-xs shadow-sm"
                        title="العودة لمجلدات القسم"
                      >
                        <ArrowIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>المجلدات</span>
                      </button>

                      <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-0.5" />

                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{currentCat?.icon || '📁'}</span>
                        <h2 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 tracking-tight truncate max-w-[150px]">
                          {currentCat?.name || t('prompts')}
                        </h2>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setEditingPrompt(null);
                        setActiveModal('create_prompt');
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-xl transition-all active:scale-95 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>أمر جديد</span>
                    </button>
                  </div>

                  {/* Filter, Sort & View Mode Toolbar */}
                  <PromptFilterBar />

                  {/* Prompts List Container */}
                  <div className="flex-1 p-3 overflow-y-auto">
                    {filteredPrompts.length === 0 ? (
                      <div className="py-12 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl mx-auto font-bold border border-amber-500/20">
                          ✨
                        </div>
                        <h4 className="font-bold text-xs text-stone-800 dark:text-stone-200">
                          لا توجد أوراق أو أوامر في هذا المجلد بعد
                        </h4>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-xs mx-auto leading-relaxed">
                          انقر على زر الإضافة (+) أدناه لإنشاء وتوثيق أول أمر ذكاء اصطناعي في هذا المجلد.
                        </p>
                        <button
                          onClick={() => {
                            setEditingPrompt(null);
                            setActiveModal('create_prompt');
                          }}
                          className="mt-2 px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-600 text-white font-bold text-xs rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{t('createPrompt')}</span>
                        </button>
                      </div>
                    ) : (
                      <div
                        className={
                          viewMode === 'grid'
                            ? 'grid grid-cols-2 gap-2.5'
                            : viewMode === 'compact'
                            ? 'grid grid-cols-3 gap-2'
                            : viewMode === 'large'
                            ? 'space-y-3'
                            : 'space-y-2'
                        }
                      >
                        {filteredPrompts.map((p) => (
                          <PromptCard key={p.id} prompt={p} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'search' && <GlobalSearchView />}
          {activeTab === 'favorites' && <FavoritesView />}
          {activeTab === 'tags' && <TagManagerView />}
          {activeTab === 'settings' && <SettingsView />}
        </div>

        {/* Bottom Navigation Bar */}
        <TabBar />

        {/* Side Navigation Drawer */}
        <SideDrawer />

        {/* Modals & Overlays */}
        <SectionModal />
        <CategoryModal />
        <PromptDetailModal />
        <PromptEditorModal />
        <TrashView />
        <StatsView />
        <BackupModal />
        <SecurityLockOverlay />
        <Toast />
      </div>
    </MobileShell>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

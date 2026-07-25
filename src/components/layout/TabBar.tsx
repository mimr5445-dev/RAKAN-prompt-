/**
 * RAKAN Prompt - iOS Bottom Tab Bar Navigation
 */

import React from 'react';
import { Layers, Search, Heart, Tag as TagIcon, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab, setActiveSectionId, setActiveCategoryId, t, stats } = useApp();

  interface TabItem {
    id: 'home' | 'search' | 'favorites' | 'tags' | 'settings';
    label: string;
    icon: any;
    badge?: number;
  }

  const tabs: TabItem[] = [
    { id: 'home', label: t('tabHome'), icon: Layers, badge: stats.totalSections },
    { id: 'search', label: t('tabSearch'), icon: Search },
    { id: 'favorites', label: t('tabFavorites'), icon: Heart, badge: stats.totalFavorites },
    { id: 'tags', label: t('tabTags'), icon: TagIcon, badge: stats.totalTags },
    { id: 'settings', label: t('tabSettings'), icon: Settings },
  ];

  const handleTabClick = (tabId: TabItem['id']) => {
    if (tabId === 'home') {
      setActiveSectionId(null);
      setActiveCategoryId(null);
    }
    setActiveTab(tabId);
  };

  return (
    <nav className="w-full h-16 bg-stone-100/95 dark:bg-stone-900/95 backdrop-blur-lg border-t border-stone-200 dark:border-stone-800 px-2 flex items-center justify-around shrink-0 z-30">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`relative flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all active:scale-95 ${
              isActive
                ? 'text-amber-700 dark:text-amber-400 font-bold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-amber-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-sm">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight truncate max-w-full">
              {tab.label}
            </span>

            {/* Active Pill Indicator */}
            {isActive && (
              <span className="absolute bottom-0 w-5 h-0.5 bg-amber-600 dark:bg-amber-400 rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

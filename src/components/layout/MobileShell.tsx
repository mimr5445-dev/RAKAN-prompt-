/**
 * RAKAN Prompt - Native iPhone 11 Pro Max Shell Frame
 * Ensures all modals, drawers and overlays remain strictly bounded within the mobile screen container.
 */

import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Smartphone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SecurityLockOverlay } from '../security/SecurityLockOverlay';

interface MobileShellProps {
  children: React.ReactNode;
}

export const MobileShell: React.FC<MobileShellProps> = ({ children }) => {
  const { settings, isLocked } = useApp();
  const [currentTime, setCurrentTime] = useState('');
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(settings.language === 'ar' ? 'ar-SA' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, [settings.language]);

  // Determine dark or light mode based on theme setting
  const isDarkMode =
    settings.themeMode === 'dark' ||
    (settings.themeMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 transition-colors duration-300 ${
      isDarkMode ? 'bg-stone-950 text-stone-100' : 'bg-amber-950/20 text-stone-900'
    }`}>
      {/* Frame Toggle Controls for Desktop Preview */}
      <div className="hidden sm:flex items-center gap-3 mb-3 text-xs opacity-75 hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsPhoneFrame(!isPhoneFrame)}
          className="flex items-center gap-1.5 px-3 py-1 bg-stone-900/80 text-amber-400 dark:bg-stone-100/90 dark:text-stone-900 rounded-full shadow-sm text-[11px] font-medium"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{isPhoneFrame ? 'إخفاء إطار الهاتف (Mobile View)' : 'إظهار إطار الآيفون (iPhone Frame)'}</span>
        </button>
      </div>

      {/* iPhone 11 Pro Max Outer Container */}
      <div
        className={`relative w-full h-[100dvh] sm:h-[880px] sm:max-w-[420px] transition-all duration-300 flex flex-col overflow-hidden bg-stone-50 dark:bg-stone-900 select-none ${
          isPhoneFrame
            ? 'sm:rounded-[48px] sm:border-[10px] sm:border-stone-800 dark:sm:border-stone-950 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] sm:ring-1 sm:ring-white/10'
            : 'sm:rounded-2xl sm:shadow-2xl'
        }`}
        style={{
          fontFamily:
            settings.fontFamily === 'cairo'
              ? "'Cairo', sans-serif"
              : settings.fontFamily === 'tajawal'
              ? "'Tajawal', sans-serif"
              : 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Top Notch / Dynamic Island Simulation */}
        {isPhoneFrame && (
          <div className="hidden sm:flex absolute top-0 left-1/2 -translate-x-1/2 h-6 w-36 bg-stone-900 dark:bg-stone-950 rounded-b-2xl z-50 items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-stone-950 ring-1 ring-stone-800" />
            <div className="w-2 h-2 rounded-full bg-blue-900/40" />
          </div>
        )}

        {/* iOS Status Bar */}
        <div className="w-full h-8 px-6 pt-1 shrink-0 flex items-center justify-between text-[11px] font-semibold tracking-tight z-40 bg-stone-100/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200/50 dark:border-stone-800/50">
          <span>{currentTime || '09:41'}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] opacity-75">5G</span>
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Main Phone Viewport Area */}
        <div className="relative flex-1 w-full flex flex-col overflow-hidden">
          {children}

          {/* Security PIN Lock Screen Overlay if enabled */}
          {isLocked && <SecurityLockOverlay />}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="w-full h-4 shrink-0 flex items-center justify-center pb-1 bg-stone-100 dark:bg-stone-900">
          <div className="w-32 h-1 bg-stone-400/50 dark:bg-stone-600/50 rounded-full" />
        </div>
      </div>
    </div>
  );
};

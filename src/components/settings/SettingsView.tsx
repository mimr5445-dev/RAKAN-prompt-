/**
 * RAKAN Prompt - Settings View
 */

import React from 'react';
import {
  Palette,
  Globe,
  Lock,
  HardDrive,
  BarChart3,
  Trash2,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Type,
  Sun,
  Moon,
  Monitor,
  User,
  LogOut,
  Users,
  LogIn,
  Cloud,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { COLOR_PRESETS } from '../../theme/colors';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    setActiveModal,
    resetApplication,
    stats,
    t,
    currentUser,
    signInWithGoogle,
    switchAccount,
    signOutGoogle,
  } = useApp();
  const isRTL = settings.language === 'ar';
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-50 dark:bg-stone-900">
      {/* Header Banner */}
      <div className="p-4 bg-gradient-to-r from-amber-900/10 via-amber-800/10 to-transparent border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm">{t('settings')}</h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">{t('appearance')}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {/* Google Authentication & Cloud Storage Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-3 shadow-sm">
          <div className="flex items-center justify-between font-bold text-stone-800 dark:text-stone-200">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-amber-500" />
              <span>المزامنة السحابية والحساب</span>
            </div>
            {currentUser && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                متصل
              </span>
            )}
          </div>

          {currentUser ? (
            <div className="space-y-3 pt-1">
              {/* Profile Details */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-100 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-700/60">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-10 h-10 rounded-full object-cover border border-amber-500/30 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-stone-900 dark:text-stone-100 truncate text-xs">
                    {currentUser.displayName || 'مستخدم RAKAN'}
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate dir-ltr">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              {/* Account Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={switchAccount}
                  className="py-2.5 px-3 rounded-xl bg-stone-200/80 dark:bg-stone-700/80 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>تبديل الحساب</span>
                </button>

                <button
                  onClick={signOutGoogle}
                  className="py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-1 text-center">
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                سجل دخولك بحساب Google لإنشاء مساحتك التخزينية السحابية الخاصة، ومزامنة الأقسام والمجلدات والأوامر تلقائياً عبر جميع أجهزتك بأمان.
              </p>
              <button
                onClick={signInWithGoogle}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-extrabold rounded-xl shadow-md shadow-amber-900/20 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول مع Google</span>
              </button>
            </div>
          )}
        </div>

        {/* Language Selection Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
          <div className="flex items-center justify-between font-bold text-stone-800 dark:text-stone-200">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>{t('language')}</span>
            </div>
            <span className="text-[10px] text-amber-600 font-bold">
              {settings.language === 'ar' ? 'افتراضي (العربية)' : 'English'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => updateSettings({ language: 'ar' })}
              className={`p-2.5 rounded-xl font-bold border transition-all ${
                settings.language === 'ar'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-md'
                  : 'bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-700'
              }`}
            >
              العربية (RTL)
            </button>

            <button
              onClick={() => updateSettings({ language: 'en' })}
              className={`p-2.5 rounded-xl font-bold border transition-all ${
                settings.language === 'en'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-md'
                  : 'bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-700'
              }`}
            >
              English (LTR)
            </button>
          </div>
        </div>

        {/* Theme Mode Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
          <div className="flex items-center gap-2 font-bold text-stone-800 dark:text-stone-200">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>{t('themeMode')}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => updateSettings({ themeMode: 'light' })}
              className={`p-2 rounded-xl font-bold border text-[11px] flex items-center justify-center gap-1 ${
                settings.themeMode === 'light'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-md'
                  : 'bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-700'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>{t('themeLight')}</span>
            </button>

            <button
              onClick={() => updateSettings({ themeMode: 'dark' })}
              className={`p-2 rounded-xl font-bold border text-[11px] flex items-center justify-center gap-1 ${
                settings.themeMode === 'dark'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-md'
                  : 'bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-700'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>{t('themeDark')}</span>
            </button>

            <button
              onClick={() => updateSettings({ themeMode: 'auto' })}
              className={`p-2 rounded-xl font-bold border text-[11px] flex items-center justify-center gap-1 ${
                settings.themeMode === 'auto'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-md'
                  : 'bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-700'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{t('themeAuto')}</span>
            </button>
          </div>
        </div>

        {/* Color Presets Palette */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
          <div className="flex items-center gap-2 font-bold text-stone-800 dark:text-stone-200">
            <Palette className="w-4 h-4 text-purple-500" />
            <span>{t('primaryColor')}</span>
          </div>

          <div className="space-y-1.5 pt-1">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => updateSettings({ primaryColor: preset.primary })}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between font-bold transition-all ${
                  settings.primaryColor === preset.primary
                    ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/10'
                    : 'border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full shadow-inner border border-white/20"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <span>{settings.language === 'ar' ? preset.nameAr : preset.nameEn}</span>
                </div>
                {settings.primaryColor === preset.primary && (
                  <span className="text-[10px] text-amber-600 font-extrabold">مُفعل</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Font Family Selection */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
          <div className="flex items-center gap-2 font-bold text-stone-800 dark:text-stone-200">
            <Type className="w-4 h-4 text-emerald-500" />
            <span>{t('fontFamily')}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 font-bold">
            <button
              onClick={() => updateSettings({ fontFamily: 'cairo' })}
              className={`p-2.5 rounded-xl border font-['Cairo'] ${
                settings.fontFamily === 'cairo'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-md'
                  : 'bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-700'
              }`}
            >
              خط القاهرة (Cairo)
            </button>

            <button
              onClick={() => updateSettings({ fontFamily: 'tajawal' })}
              className={`p-2.5 rounded-xl border font-['Tajawal'] ${
                settings.fontFamily === 'tajawal'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-md'
                  : 'bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-700'
              }`}
            >
              خط تجول (Tajawal)
            </button>
          </div>
        </div>

        {/* Backup & Security Shortcuts */}
        <div className="space-y-2">
          <button
            onClick={() => setActiveModal('backup_manager')}
            className="w-full p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between font-bold text-stone-800 dark:text-stone-200"
          >
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-500" />
              <span>{t('backupAndExport')}</span>
            </div>
            <ArrowIcon className="w-4 h-4 text-stone-400" />
          </button>

          <button
            onClick={() => setActiveModal('pin_lock')}
            className="w-full p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between font-bold text-stone-800 dark:text-stone-200"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" />
              <span>{t('securityLock')}</span>
            </div>
            <ArrowIcon className="w-4 h-4 text-stone-400" />
          </button>
        </div>

        {/* Reset App */}
        <div className="pt-2">
          <button
            onClick={() => {
              if (window.confirm(t('resetAppConfirm'))) {
                resetApplication();
              }
            }}
            className="w-full py-3 bg-red-600/10 text-red-600 dark:text-red-400 font-extrabold rounded-2xl hover:bg-red-600/20 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('resetApp')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

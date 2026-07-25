/**
 * RAKAN Prompt - Security PIN Keypad & Face ID / Touch ID Lock Screen
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, Delete, Fingerprint, ShieldAlert, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SecurityLockOverlay: React.FC = () => {
  const {
    isLocked,
    setIsLocked,
    settings,
    updateSettings,
    activeModal,
    setActiveModal,
    showToast,
    t,
  } = useApp();

  const isConfiguringPin = activeModal === 'pin_lock';

  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Mode 1: App is locked and needs PIN or Face ID to unlock
  if (isLocked) {
    const handleKeyPress = (num: string) => {
      if (enteredPin.length < 4) {
        const next = enteredPin + num;
        setEnteredPin(next);
        setErrorMsg('');

        if (next.length === 4) {
          if (next === settings.securityPin) {
            setIsLocked(false);
            setEnteredPin('');
            showToast('تم إلغاء القفل بنجاح');
          } else {
            setErrorMsg(t('invalidPinCode'));
            setTimeout(() => setEnteredPin(''), 600);
          }
        }
      }
    };

    const handleBackspace = () => {
      setEnteredPin((prev) => prev.slice(0, -1));
    };

    const handleBiometrics = () => {
      setIsLocked(false);
      showToast('تم التحقق بنجاح باستخدام Face ID / Touch ID');
    };

    return (
      <div className="absolute inset-0 z-50 bg-stone-950/95 backdrop-blur-xl flex flex-col items-center justify-between p-6 text-white">
        {/* Header Icon */}
        <div className="flex flex-col items-center space-y-3 pt-12">
          <div className="p-4 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-xl">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-base font-extrabold">{t('appName')}</h2>
          <p className="text-xs text-stone-400">{t('enterPinCode')}</p>
        </div>

        {/* PIN Indicators */}
        <div className="flex items-center gap-4 my-4">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                enteredPin.length > idx
                  ? 'bg-amber-500 border-amber-400 scale-110 shadow-lg shadow-amber-500/50'
                  : 'border-stone-700 bg-stone-900'
              }`}
            />
          ))}
        </div>

        {errorMsg && <p className="text-xs font-bold text-red-400 text-center">{errorMsg}</p>}

        {/* Numeric Keypad */}
        <div className="w-full max-w-xs grid grid-cols-3 gap-4 pb-8 text-lg font-bold">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-16 h-16 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-100 flex items-center justify-center mx-auto active:scale-95 transition-all shadow-md"
            >
              {num}
            </button>
          ))}

          {/* Biometrics */}
          <button
            onClick={handleBiometrics}
            className="w-16 h-16 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-800 text-amber-400 flex items-center justify-center mx-auto active:scale-95 transition-all"
            title="Face ID / Touch ID"
          >
            <Fingerprint className="w-6 h-6" />
          </button>

          {/* Zero */}
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-100 flex items-center justify-center mx-auto active:scale-95 transition-all"
          >
            0
          </button>

          {/* Backspace */}
          <button
            onClick={handleBackspace}
            className="w-16 h-16 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 flex items-center justify-center mx-auto active:scale-95 transition-all"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Mode 2: User opens Security Lock modal from Settings to configure or disable PIN
  if (isConfiguringPin) {
    return (
      <AnimatePresence>
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-full max-w-md bg-stone-100 dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm">{t('securityLock')}</h3>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toggle Switch */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <span className="font-bold">{t('enablePinLock')}</span>
                <input
                  type="checkbox"
                  checked={settings.isSecurityEnabled}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    updateSettings({
                      isSecurityEnabled: enabled,
                      securityPin: enabled ? settings.securityPin || '1234' : null,
                    });
                  }}
                  className="w-5 h-5 accent-amber-600 rounded"
                />
              </div>

              {settings.isSecurityEnabled && (
                <div className="p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
                  <label className="block font-bold">{t('createPinCode')}</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={settings.securityPin || ''}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        updateSettings({ securityPin: e.target.value });
                      }
                    }}
                    placeholder="1234"
                    className="w-full p-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 font-mono text-center tracking-widest text-lg font-extrabold border outline-none"
                  />
                  <p className="text-[10px] text-stone-500 text-center">
                    احفظ هذا الرمز جيداً لدخول التطبيق لاحقاً.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return null;
};

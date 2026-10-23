import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useT } from '../../i18n/useT.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import {
  EmergencyCrossIcon,
  VolumeIcon,
  VolumeOffIcon,
  HomeIcon,
  TicketIcon,
  SearchIcon,
  SettingsIcon,
  GlobeIcon,
  AlertIcon,
} from '../common/Icons.jsx';
import LanguageChooserModal from '../common/LanguageChooserModal.jsx';

export default function PatientLayout({ children }) {
  const { t } = useT();
  const { language, setLanguage, readAloud } = useSettings();
  const location = useLocation();

  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speaking when navigating to another page
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [location.pathname]);

  // Read Aloud via Web Speech API
  const handleReadAloud = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const mainEl = document.getElementById('main-content');
    if (!mainEl) return;

    const clone = mainEl.cloneNode(true);
    // Strip non-readable items
    const elementsToRemove = clone.querySelectorAll('button, svg, script, style, [aria-hidden="true"]');
    elementsToRemove.forEach((el) => el.remove());
    const cleanText = clone.innerText.replace(/\s+/g, ' ').trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.85; // Calm pace for elderly comprehension

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const navItems = [
    { to: '/', labelKey: 'nav.home', icon: HomeIcon },
    { to: '/register', labelKey: 'nav.register', icon: TicketIcon },
    { to: '/have-slip', labelKey: 'home.haveSlipBtn', icon: TicketIcon },
    { to: '/find', labelKey: 'home.findPlaceBtn', icon: SearchIcon },
    { to: '/settings', labelKey: 'nav.settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* 1. PERSISTENT EMERGENCY BAR (Always visible, never hidden by scroll, high-contrast red) */}
      <div
        role="region"
        aria-label="Emergency Assistance Bar"
        className="sticky top-0 z-50 bg-emergency-600 text-white shadow-xl border-b-2 border-emergency-800 px-3 py-2"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Main Emergency Button linking directly to /emergency */}
          <Link
            id="btn-emergency-sticky"
            to="/emergency"
            className="flex-1 min-h-[56px] px-4 py-2 bg-white text-emergency-700 hover:bg-emergency-50 active:bg-emergency-100 font-black rounded-xl border-2 border-white flex items-center justify-center gap-2.5 shadow-md focus:ring-4 focus:ring-amber-300 focus:outline-none text-base sm:text-lg uppercase tracking-wide"
            aria-label={t('emergency.button')}
          >
            <EmergencyCrossIcon className="w-7 h-7 text-emergency-600 animate-pulse flex-shrink-0" />
            <span className="font-extrabold">{t('emergency.button')}</span>
          </Link>

          {/* Quick Listen Button in Emergency Bar / Header */}
          <button
            id="btn-listen-screen"
            type="button"
            onClick={handleReadAloud}
            className={`min-h-[56px] px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 border-2 focus:ring-4 focus:ring-amber-300 focus:outline-none text-base sm:text-lg flex-shrink-0 ${
              isSpeaking
                ? 'bg-amber-400 text-black border-amber-500 animate-pulse font-black'
                : 'bg-emergency-800 text-white hover:bg-emergency-900 border-emergency-500'
            }`}
            aria-label={isSpeaking ? t('a11y.stopListen') : t('a11y.listen')}
          >
            {isSpeaking ? (
              <>
                <VolumeOffIcon className="w-6 h-6 flex-shrink-0" />
                <span className="hidden sm:inline">{t('a11y.stopListen')}</span>
              </>
            ) : (
              <>
                <VolumeIcon className="w-6 h-6 flex-shrink-0" />
                <span className="hidden sm:inline">{t('a11y.listen')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Top App Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-hospital-400 rounded-lg">
            <span className="w-10 h-10 rounded-xl bg-hospital-600 text-white flex items-center justify-center font-black text-xl flex-shrink-0">
              🏥
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-hospital-900 dark:text-white leading-tight">
                {t('hospital.name')}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                {t('app.title')} • {t('hospital.tagline')}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {/* Quick Language Toggle */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
              className="min-h-[48px] px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-white font-bold rounded-xl border border-slate-300 dark:border-slate-600 flex items-center gap-1.5 text-sm focus:ring-2 focus:ring-hospital-400"
              aria-label="Toggle Language"
            >
              <GlobeIcon className="w-5 h-5 text-hospital-600 dark:text-hospital-400" />
              <span>{language === 'hi' ? 'EN' : 'हिं'}</span>
            </button>

            {/* Settings Link */}
            <Link
              to="/settings"
              className="min-h-[48px] px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-white font-bold rounded-xl border border-slate-300 dark:border-slate-600 flex items-center gap-1.5 text-sm focus:ring-2 focus:ring-hospital-400"
              aria-label="Settings"
            >
              <SettingsIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              <span className="hidden sm:inline">{t('nav.settings')}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Main Patient Screen Content Container */}
      <main id="main-content" className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 pb-24">
        {children}
      </main>

      {/* 4. Bottom Navigation Bar */}
      <nav
        role="navigation"
        aria-label="Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t-2 border-slate-300 dark:border-slate-700 shadow-2xl"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-around px-1 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`min-h-[56px] flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl font-bold text-xs sm:text-sm transition-colors focus:ring-4 focus:ring-hospital-400 focus:outline-none ${
                  isActive
                    ? 'text-hospital-700 dark:text-hospital-300 bg-hospital-100 dark:bg-hospital-950 font-black border-2 border-hospital-600'
                    : 'text-slate-600 dark:text-slate-400 hover:text-hospital-600'
                }`}
              >
                <Icon className="w-6 h-6 mb-0.5 flex-shrink-0" />
                <span className="text-center line-clamp-1">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 5. First-Visit Language Chooser Modal */}
      <LanguageChooserModal />
    </div>
  );
}

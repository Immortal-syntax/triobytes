import React from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { GlobeIcon, CheckCircleIcon } from './Icons.jsx';

export default function LanguageChooserModal() {
  const { language, setLanguage, hasChosenLanguage, setHasChosenLanguage } = useSettings();

  if (hasChosenLanguage) return null;

  const selectLang = (lang) => {
    setLanguage(lang);
    setHasChosenLanguage(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-4 border-hospital-600 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 bg-hospital-100 dark:bg-hospital-950 text-hospital-600 rounded-2xl flex items-center justify-center mx-auto border-2 border-hospital-400">
          <GlobeIcon className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 id="lang-modal-title" className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Choose Your Language
          </h2>
          <p className="text-xl sm:text-2xl font-bold text-hospital-700 dark:text-hospital-400">
            अपनी भाषा चुनें
          </p>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            City District Hospital • ज़िला नागरिक चिकित्सालय
          </p>
        </div>

        {/* Big Touch Buttons in Native Scripts */}
        <div className="grid grid-cols-1 gap-4 pt-2">
          {/* Hindi Button */}
          <button
            id="btn-choose-hi"
            type="button"
            onClick={() => selectLang('hi')}
            className="w-full min-h-[72px] p-4 bg-hospital-600 hover:bg-hospital-700 active:bg-hospital-800 text-white font-black text-2xl rounded-2xl flex items-center justify-between shadow-lg focus:ring-4 focus:ring-amber-300 focus:outline-none transition-transform active:scale-98 border-2 border-hospital-700"
          >
            <div className="text-left">
              <span className="block text-2xl sm:text-3xl">हिंदी</span>
              <span className="text-xs sm:text-sm font-semibold opacity-90 block">हिंदी में जारी रखें</span>
            </div>
            <span className="text-3xl">🇮🇳</span>
          </button>

          {/* English Button */}
          <button
            id="btn-choose-en"
            type="button"
            onClick={() => selectLang('en')}
            className="w-full min-h-[72px] p-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black text-2xl rounded-2xl flex items-center justify-between shadow-md border-3 border-slate-300 dark:border-slate-600 focus:ring-4 focus:ring-amber-300 focus:outline-none transition-transform active:scale-98"
          >
            <div className="text-left">
              <span className="block text-2xl sm:text-3xl">English</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 block">Continue in English</span>
            </div>
            <span className="text-2xl text-hospital-600">EN</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
          You can change your language anytime in Settings • आप बाद में कभी भी सेटिंग से भाषा बदल सकते हैं
        </p>
      </div>
    </div>
  );
}

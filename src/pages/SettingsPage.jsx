import React from 'react';
import { useT } from '../i18n/useT.js';
import { useSettings } from '../context/SettingsContext.jsx';
import {
  SettingsIcon,
  GlobeIcon,
  TextSizeIcon,
  ContrastIcon,
  VolumeIcon,
  RampIcon,
  UserIcon,
  CheckCircleIcon,
} from '../components/common/Icons.jsx';

export default function SettingsPage() {
  const { t } = useT();
  const {
    language,
    setLanguage,
    textSize,
    setTextSize,
    highContrast,
    setHighContrast,
    readAloud,
    setReadAloud,
    avoidStairs,
    setAvoidStairs,
    assistedMode,
    setAssistedMode,
  } = useSettings();

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12">
      {/* Title */}
      <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-3">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-hospital-600 dark:text-hospital-400" />
          <span>{t('settings.title')}</span>
        </h2>
        <p className="text-base text-slate-600 dark:text-slate-300 mt-1">
          Adjust text size, contrast, language, and walking preferences
        </p>
      </div>

      {/* 1. Language Chooser */}
      <section className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-hospital-800 dark:text-hospital-300 font-bold text-lg">
          <GlobeIcon className="w-6 h-6" />
          <span>{t('settings.languageLabel')}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setLanguage('hi')}
            className={`min-h-[56px] p-3 rounded-xl border-3 font-black text-xl flex items-center justify-center gap-2 transition-all focus:ring-4 focus:ring-hospital-400 focus:outline-none ${
              language === 'hi'
                ? 'bg-hospital-600 text-white border-hospital-700 shadow-md ring-2 ring-hospital-400'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-200'
            }`}
            aria-pressed={language === 'hi'}
          >
            <span>हिंदी (Hindi)</span>
            {language === 'hi' && <CheckCircleIcon className="w-6 h-6" />}
          </button>

          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`min-h-[56px] p-3 rounded-xl border-3 font-black text-xl flex items-center justify-center gap-2 transition-all focus:ring-4 focus:ring-hospital-400 focus:outline-none ${
              language === 'en'
                ? 'bg-hospital-600 text-white border-hospital-700 shadow-md ring-2 ring-hospital-400'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-200'
            }`}
            aria-pressed={language === 'en'}
          >
            <span>English</span>
            {language === 'en' && <CheckCircleIcon className="w-6 h-6" />}
          </button>
        </div>
      </section>

      {/* 2. Text Size (1 = 18px, 2 = 22px, 3 = 26px) */}
      <section className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-hospital-800 dark:text-hospital-300 font-bold text-lg">
          <TextSizeIcon className="w-6 h-6" />
          <span>{t('settings.textSizeLabel')}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 1, label: t('settings.size1'), scale: 'A' },
            { id: 2, label: t('settings.size2'), scale: 'A+' },
            { id: 3, label: t('settings.size3'), scale: 'A++' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTextSize(item.id)}
              className={`min-h-[56px] p-2 rounded-xl border-2 font-bold flex flex-col items-center justify-center text-center transition-all focus:ring-4 focus:ring-hospital-400 focus:outline-none ${
                textSize === item.id
                  ? 'bg-hospital-600 text-white border-hospital-700 shadow ring-2 ring-hospital-400'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-200'
              }`}
              aria-pressed={textSize === item.id}
            >
              <span className="text-xl font-black">{item.scale}</span>
              <span className="text-xs font-semibold mt-0.5 line-clamp-1">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. High Contrast Mode */}
      <section className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
        <label className="flex items-start justify-between gap-4 cursor-pointer">
          <div className="space-y-1">
            <span className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
              <ContrastIcon className="w-6 h-6 text-hospital-600 dark:text-hospital-400" />
              <span>{t('settings.highContrastLabel')}</span>
            </span>
            <span className="text-sm sm:text-base text-slate-600 dark:text-slate-300 block">
              {t('settings.highContrastDesc')}
            </span>
          </div>

          <input
            type="checkbox"
            checked={highContrast}
            onChange={(e) => setHighContrast(e.target.checked)}
            className="w-8 h-8 rounded border-2 border-slate-400 text-hospital-600 focus:ring-4 focus:ring-hospital-400 mt-1 flex-shrink-0"
          />
        </label>
      </section>

      {/* 4. Read Aloud by Default */}
      <section className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
        <label className="flex items-start justify-between gap-4 cursor-pointer">
          <div className="space-y-1">
            <span className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
              <VolumeIcon className="w-6 h-6 text-hospital-600 dark:text-hospital-400" />
              <span>{t('settings.readAloudLabel')}</span>
            </span>
            <span className="text-sm sm:text-base text-slate-600 dark:text-slate-300 block">
              {t('settings.readAloudDesc')}
            </span>
          </div>

          <input
            type="checkbox"
            checked={readAloud}
            onChange={(e) => setReadAloud(e.target.checked)}
            className="w-8 h-8 rounded border-2 border-slate-400 text-hospital-600 focus:ring-4 focus:ring-hospital-400 mt-1 flex-shrink-0"
          />
        </label>
      </section>

      {/* 5. Avoid Stairs (Prefer Ramps & Lifts) */}
      <section className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-5 shadow-sm">
        <label className="flex items-start justify-between gap-4 cursor-pointer">
          <div className="space-y-1">
            <span className="flex items-center gap-2 font-bold text-lg text-amber-950 dark:text-amber-100">
              <RampIcon className="w-6 h-6 text-amber-600" />
              <span>{t('settings.avoidStairsLabel')}</span>
            </span>
            <span className="text-sm sm:text-base text-amber-900 dark:text-amber-200 block">
              {t('settings.avoidStairsDesc')}
            </span>
          </div>

          <input
            type="checkbox"
            checked={avoidStairs}
            onChange={(e) => setAvoidStairs(e.target.checked)}
            className="w-8 h-8 rounded border-2 border-slate-400 text-amber-600 focus:ring-4 focus:ring-amber-400 mt-1 flex-shrink-0"
          />
        </label>
      </section>

      {/* 6. Assisted Mode */}
      <section className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
        <label className="flex items-start justify-between gap-4 cursor-pointer">
          <div className="space-y-1">
            <span className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
              <UserIcon className="w-6 h-6 text-hospital-600 dark:text-hospital-400" />
              <span>{t('settings.assistedModeLabel')}</span>
            </span>
            <span className="text-sm sm:text-base text-slate-600 dark:text-slate-300 block">
              {t('settings.assistedModeDesc')}
            </span>
          </div>

          <input
            type="checkbox"
            checked={assistedMode}
            onChange={(e) => setAssistedMode(e.target.checked)}
            className="w-8 h-8 rounded border-2 border-slate-400 text-hospital-600 focus:ring-4 focus:ring-hospital-400 mt-1 flex-shrink-0"
          />
        </label>
      </section>
    </div>
  );
}

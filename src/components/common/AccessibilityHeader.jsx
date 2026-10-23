import React from 'react';
import { useI18n } from '../../context/I18nContext.jsx';
import { useAccessibility } from '../../context/AccessibilityContext.jsx';
import {
  GlobeIcon,
  TextSizeIcon,
  ContrastIcon,
  VolumeIcon,
  VolumeOffIcon,
} from './Icons.jsx';

export default function AccessibilityHeader() {
  const { lang, toggleLanguage, t } = useI18n();
  const {
    textSize,
    cycleTextSize,
    highContrast,
    toggleHighContrast,
    readScreen,
    stopSpeaking,
    isSpeaking,
  } = useAccessibility();

  // Text size label
  const textSizeLabel =
    textSize === 'normal'
      ? t('a11y.normal')
      : textSize === 'large'
      ? t('a11y.large')
      : t('a11y.xlarge');

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Accessibility Toolbar */}
      <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-3 py-2">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Read Aloud Button (CRITICAL ACCESSIBILITY RULE) */}
          <button
            id="btn-read-aloud"
            type="button"
            onClick={() => (isSpeaking ? stopSpeaking() : readScreen())}
            className={`min-h-[56px] px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition-colors focus:ring-4 focus:ring-hospital-400 focus:outline-none text-base sm:text-lg ${
              isSpeaking
                ? 'bg-amber-500 text-black border-amber-600 animate-pulse'
                : 'bg-hospital-700 text-white hover:bg-hospital-800 border-hospital-800'
            }`}
            aria-label={isSpeaking ? t('a11y.stopListen') : t('a11y.listen')}
          >
            {isSpeaking ? (
              <>
                <VolumeOffIcon className="w-6 h-6 flex-shrink-0" />
                <span>{t('a11y.stopListen')}</span>
              </>
            ) : (
              <>
                <VolumeIcon className="w-6 h-6 flex-shrink-0" />
                <span>{t('a11y.listen')}</span>
              </>
            )}
          </button>

          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {/* Language Switcher */}
            <button
              id="btn-lang-toggle"
              type="button"
              onClick={toggleLanguage}
              className="min-h-[56px] px-3.5 py-2 bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-xl border-2 border-slate-300 dark:border-slate-600 flex items-center gap-2 focus:ring-4 focus:ring-hospital-400 focus:outline-none text-base"
              aria-label={`Switch language to ${lang === 'hi' ? 'English' : 'Hindi'}`}
            >
              <GlobeIcon className="w-6 h-6 text-hospital-600 dark:text-hospital-400 flex-shrink-0" />
              <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
            </button>

            {/* Text Size Switcher */}
            <button
              id="btn-text-size-toggle"
              type="button"
              onClick={cycleTextSize}
              className="min-h-[56px] px-3.5 py-2 bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-xl border-2 border-slate-300 dark:border-slate-600 flex items-center gap-2 focus:ring-4 focus:ring-hospital-400 focus:outline-none text-base"
              aria-label={`${t('a11y.textSize')}: ${textSizeLabel}`}
            >
              <TextSizeIcon className="w-6 h-6 text-hospital-600 dark:text-hospital-400 flex-shrink-0" />
              <span>{textSizeLabel}</span>
            </button>

            {/* High Contrast Mode Toggle */}
            <button
              id="btn-contrast-toggle"
              type="button"
              onClick={toggleHighContrast}
              className={`min-h-[56px] px-3.5 py-2 rounded-xl font-bold border-2 flex items-center gap-2 focus:ring-4 focus:ring-hospital-400 focus:outline-none text-base ${
                highContrast
                  ? 'bg-amber-400 text-black border-black font-extrabold'
                  : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white border-slate-300 dark:border-slate-600 hover:bg-slate-200'
              }`}
              aria-label={highContrast ? t('a11y.contrastNormal') : t('a11y.contrastHigh')}
            >
              <ContrastIcon className="w-6 h-6 flex-shrink-0" />
              <span className="hidden xs:inline">
                {highContrast ? t('a11y.contrastNormal') : t('a11y.contrastHigh')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Hospital Identity Bar */}
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-hospital-600 text-white flex items-center justify-center font-black text-2xl shadow-sm flex-shrink-0 border-2 border-hospital-700">
            🏥
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-hospital-900 dark:text-white leading-tight">
              {t('hospital.name')}
            </h1>
            <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300">
              {t('hospital.tagline')}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

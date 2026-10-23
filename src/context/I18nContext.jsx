import React from 'react';
import { useSettings } from './SettingsContext.jsx';
import { useT } from '../i18n/useT.js';

export function I18nProvider({ children }) {
  return <>{children}</>;
}

export function useI18n() {
  const { language, setLanguage } = useSettings();
  const { t } = useT();

  const toggleLanguage = () => {
    setLanguage(language === 'hi' ? 'en' : 'hi');
  };

  return {
    lang: language,
    language,
    setLang: setLanguage,
    setLanguage,
    toggleLanguage,
    t,
  };
}

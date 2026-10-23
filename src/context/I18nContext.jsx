import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../i18n/en.js';
import { hi } from '../i18n/hi.js';

const I18nContext = createContext(null);

const translations = { en, hi };

export function I18nProvider({ children }) {
  // Default to Hindi ('hi') to support Kamla and local patients
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('opd_lang') || 'hi';
  });

  useEffect(() => {
    localStorage.setItem('opd_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'hi' ? 'en' : 'hi'));
  };

  /**
   * Translate key with optional variable replacements e.g. {to}, {dist}
   */
  const t = (key, params = {}) => {
    const currentDict = translations[lang] || translations.hi;
    let text = currentDict[key] || translations.en[key] || key;

    if (params && typeof params === 'object') {
      Object.keys(params).forEach(k => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), params[k]);
      });
    }
    return text;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

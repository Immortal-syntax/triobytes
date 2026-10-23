import { useSettings } from '../context/SettingsContext.jsx';
import { en } from './en.js';
import { hi } from './hi.js';

/**
 * Hook providing translation function t(key, vars)
 * If a Hindi key is missing, falls back to English and calls console.warn
 */
export function useT() {
  const { language } = useSettings();

  const t = (key, vars = {}) => {
    let text;

    if (language === 'hi') {
      if (hi && hi[key] !== undefined) {
        text = hi[key];
      } else {
        console.warn(`[i18n] Missing Hindi key for "${key}", falling back to English`);
        text = en && en[key] !== undefined ? en[key] : key;
      }
    } else {
      text = en && en[key] !== undefined ? en[key] : key;
    }

    if (vars && typeof vars === 'object') {
      Object.keys(vars).forEach((v) => {
        text = text.replace(new RegExp(`\\{${v}\\}`, 'g'), vars[v]);
      });
    }

    return text;
  };

  return { t, language };
}

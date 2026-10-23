import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  // 1. Language: 'en' | 'hi' (defaults to 'hi')
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('opd_language') || 'hi';
  });

  // First visit language chooser tracking
  const [hasChosenLanguage, setHasChosenLanguageState] = useState(() => {
    return localStorage.getItem('opd_has_chosen_lang') === 'true';
  });

  // 2. Text size: 1 (18px) | 2 (22px) | 3 (26px)
  const [textSize, setTextSizeState] = useState(() => {
    const saved = localStorage.getItem('opd_text_size_num');
    return saved ? Number(saved) : 1;
  });

  // 3. High contrast: boolean
  const [highContrast, setHighContrastState] = useState(() => {
    return localStorage.getItem('opd_high_contrast') === 'true';
  });

  // 4. Read aloud: boolean
  const [readAloud, setReadAloudState] = useState(() => {
    return localStorage.getItem('opd_read_aloud') === 'true';
  });

  // 5. Avoid stairs: boolean (default true for Kamla / elderly)
  const [avoidStairs, setAvoidStairsState] = useState(() => {
    const saved = localStorage.getItem('opd_avoid_stairs');
    return saved !== null ? saved === 'true' : true;
  });

  // 6. Assisted mode: boolean
  const [assistedMode, setAssistedModeState] = useState(() => {
    return localStorage.getItem('opd_assisted_mode') === 'true';
  });

  // Setter wrappers that persist to localStorage
  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('opd_language', lang);
    localStorage.setItem('opd_lang', lang);
  };

  const setHasChosenLanguage = (val) => {
    setHasChosenLanguageState(val);
    localStorage.setItem('opd_has_chosen_lang', String(val));
  };

  const setTextSize = (size) => {
    const num = Number(size);
    setTextSizeState(num);
    localStorage.setItem('opd_text_size_num', String(num));
  };

  const setHighContrast = (val) => {
    setHighContrastState(val);
    localStorage.setItem('opd_high_contrast', String(val));
  };

  const setReadAloud = (val) => {
    setReadAloudState(val);
    localStorage.setItem('opd_read_aloud', String(val));
  };

  const setAvoidStairs = (val) => {
    setAvoidStairsState(val);
    localStorage.setItem('opd_avoid_stairs', String(val));
  };

  const setAssistedMode = (val) => {
    setAssistedModeState(val);
    localStorage.setItem('opd_assisted_mode', String(val));
  };

  // Synchronize <html> root element classes and font size
  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;

    // Apply text size class and base font size
    root.classList.remove('text-size-1', 'text-size-2', 'text-size-3', 'text-normal', 'text-large', 'text-xlarge');
    root.classList.add(`text-size-${textSize}`);

    if (textSize === 1) {
      root.style.fontSize = '18px'; // Base 18px
    } else if (textSize === 2) {
      root.style.fontSize = '22px'; // Base 22px
    } else if (textSize === 3) {
      root.style.fontSize = '26px'; // Base 26px
    }

    // Apply high contrast class
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [language, textSize, highContrast]);

  return (
    <SettingsContext.Provider
      value={{
        language,
        setLanguage,
        hasChosenLanguage,
        setHasChosenLanguage,
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
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
}

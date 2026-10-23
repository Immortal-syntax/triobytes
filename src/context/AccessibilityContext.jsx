import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useI18n } from './I18nContext.jsx';

const AccessibilityContext = createContext(null);

export function AccessibilityProvider({ children }) {
  const { lang, t } = useI18n();

  // Font size: 'normal' (18px) | 'large' (21px) | 'xlarge' (25px)
  const [textSize, setTextSize] = useState(() => {
    return localStorage.getItem('opd_text_size') || 'normal';
  });

  // High contrast mode
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('opd_high_contrast') === 'true';
  });

  // Screen reader / SpeechSynthesis state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Apply font size class and CSS variable to root
  useEffect(() => {
    localStorage.setItem('opd_text_size', textSize);
    const root = document.documentElement;
    root.classList.remove('text-normal', 'text-large', 'text-xlarge');
    root.classList.add(`text-${textSize}`);

    if (textSize === 'normal') {
      root.style.fontSize = '18px';
    } else if (textSize === 'large') {
      root.style.fontSize = '21px';
    } else if (textSize === 'xlarge') {
      root.style.fontSize = '25px';
    }
  }, [textSize]);

  // Apply high contrast class
  useEffect(() => {
    localStorage.setItem('opd_high_contrast', highContrast);
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Stop speaking on unmount or navigation
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Web Speech synthesis
  const speak = useCallback((text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    if (!text || text.trim().length === 0) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85; // Calm, clear, accessible speed
    utterance.pitch = 1.0;

    // Pick appropriate voice
    const voices = window.speechSynthesis.getVoices();
    if (lang === 'hi') {
      utterance.lang = 'hi-IN';
      const hiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.includes('Hindi'));
      if (hiVoice) utterance.voice = hiVoice;
    } else {
      utterance.lang = 'en-IN';
      const enVoice = voices.find(v => v.lang.startsWith('en-IN') || v.lang.startsWith('en-GB') || v.lang.startsWith('en-US'));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [lang]);

  // Helper to read main page content aloud
  const readScreen = useCallback((overrideText = null) => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (overrideText) {
      speak(overrideText);
      return;
    }

    const mainEl = document.getElementById('main-content');
    if (mainEl) {
      // Clean visible text from elements
      const clone = mainEl.cloneNode(true);
      // Remove buttons like listen or emergency from text stream
      const ignoreElements = clone.querySelectorAll('button, svg, script, style, [aria-hidden="true"]');
      ignoreElements.forEach(el => el.remove());
      const cleanText = clone.innerText.replace(/\s+/g, ' ').trim();
      speak(cleanText);
    }
  }, [isSpeaking, speak, stopSpeaking]);

  const cycleTextSize = () => {
    setTextSize(curr => {
      if (curr === 'normal') return 'large';
      if (curr === 'large') return 'xlarge';
      return 'normal';
    });
  };

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        textSize,
        setTextSize,
        cycleTextSize,
        highContrast,
        toggleHighContrast,
        speak,
        stopSpeaking,
        readScreen,
        isSpeaking,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

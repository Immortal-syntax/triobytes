import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../context/I18nContext.jsx';
import { EmergencyCrossIcon } from './Icons.jsx';

/**
 * EmergencyBar – visible in the sticky header on every patient screen.
 * Clicking the button navigates directly to /emergency (no modal).
 */
export default function EmergencyBar() {
  const { t } = useI18n();

  return (
    <div
      role="region"
      aria-label="Emergency Assistance Bar"
      className="bg-emergency-600 text-white shadow-md border-b-2 border-emergency-800 px-3 py-2"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-center">
        <Link
          id="btn-emergency-global"
          to="/emergency"
          className="w-full min-h-[56px] px-4 py-2 bg-white text-emergency-700 hover:bg-emergency-50 active:bg-emergency-100 font-bold rounded-xl border-2 border-white flex items-center justify-center gap-3 shadow-lg focus:ring-4 focus:ring-amber-300 focus:outline-none transition-transform active:scale-95 text-lg"
          aria-label={t('emergency.button')}
        >
          <EmergencyCrossIcon className="w-8 h-8 text-emergency-600 animate-pulse flex-shrink-0" />
          <span className="font-extrabold tracking-wide uppercase">
            {t('emergency.button')}
          </span>
        </Link>
      </div>
    </div>
  );
}

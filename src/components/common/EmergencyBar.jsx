import React from 'react';
import { useI18n } from '../../context/I18nContext.jsx';
import { useHospital } from '../../context/HospitalContext.jsx';
import { EmergencyCrossIcon, AlertIcon } from './Icons.jsx';

export default function EmergencyBar() {
  const { t } = useI18n();
  const { setEmergencyModalOpen, setUrgentHelpModalOpen } = useHospital();

  return (
    <div
      role="region"
      aria-label="Emergency and Urgent Assistance Bar"
      className="bg-emergency-600 text-white shadow-md border-b-2 border-emergency-800 px-3 py-2"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        {/* Main Emergency Button (Visible on EVERY screen) */}
        <button
          id="btn-emergency-global"
          type="button"
          onClick={() => setEmergencyModalOpen(true)}
          className="min-h-[56px] px-4 py-2 bg-white text-emergency-700 hover:bg-emergency-50 active:bg-emergency-100 font-bold rounded-xl border-2 border-white flex items-center justify-center gap-3 shadow-lg focus:ring-4 focus:ring-amber-300 focus:outline-none transition-transform active:scale-95 text-lg"
          aria-label={t('emergency.button')}
        >
          <EmergencyCrossIcon className="w-8 h-8 text-emergency-600 animate-pulse flex-shrink-0" />
          <span className="text-left font-extrabold tracking-wide uppercase">
            {t('emergency.button')}
          </span>
        </button>

        {/* Secondary Urgent Help Request */}
        <button
          id="btn-urgent-help-global"
          type="button"
          onClick={() => setUrgentHelpModalOpen(true)}
          className="min-h-[56px] px-4 py-2 bg-emergency-800 hover:bg-emergency-900 active:bg-black text-white font-semibold rounded-xl border-2 border-emergency-400 flex items-center justify-center gap-2 shadow focus:ring-4 focus:ring-amber-300 focus:outline-none text-base sm:text-lg"
          aria-label={t('urgentHelp.button')}
        >
          <AlertIcon className="w-6 h-6 text-amber-300 flex-shrink-0" />
          <span>{t('urgentHelp.button')}</span>
        </button>
      </div>
    </div>
  );
}

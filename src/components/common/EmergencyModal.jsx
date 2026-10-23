import React, { useEffect, useRef } from 'react';
import { useI18n } from '../../context/I18nContext.jsx';
import { useHospital } from '../../context/HospitalContext.jsx';
import { useNavigate } from 'react-router-dom';
import { EmergencyCrossIcon, PhoneIcon, MapPinIcon, CloseIcon, InfoIcon } from './Icons.jsx';

export default function EmergencyModal() {
  const { t } = useI18n();
  const { emergencyModalOpen, setEmergencyModalOpen } = useHospital();
  const navigate = useNavigate();
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (emergencyModalOpen) {
      // Focus close button on open for accessibility
      setTimeout(() => closeBtnRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [emergencyModalOpen]);

  if (!emergencyModalOpen) return null;

  const handleOpenMap = () => {
    setEmergencyModalOpen(false);
    navigate('/map?dest=casualty');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-4 border-emergency-600 rounded-2xl shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="bg-emergency-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EmergencyCrossIcon className="w-8 h-8 text-white animate-pulse" />
            <h2 id="emergency-dialog-title" className="text-xl sm:text-2xl font-black">
              {t('emergency.title')}
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={() => setEmergencyModalOpen(false)}
            className="min-h-[48px] min-w-[48px] p-2 bg-emergency-800 hover:bg-emergency-900 text-white rounded-lg focus:ring-4 focus:ring-white focus:outline-none flex items-center justify-center"
            aria-label={t('emergency.close')}
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* 1-Line Definition */}
          <div className="bg-amber-50 border-2 border-amber-300 p-3 rounded-xl flex items-start gap-2 text-slate-800">
            <InfoIcon className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
            <p className="font-medium text-base sm:text-lg">
              {t('def.casualty')}
            </p>
          </div>

          {/* Primary Safety Alert Box */}
          <div className="bg-emergency-50 border-2 border-emergency-300 p-4 rounded-xl text-emergency-900 space-y-2">
            <p className="font-extrabold text-xl sm:text-2xl text-emergency-700 leading-snug">
              🚨 {t('emergency.urgentNotice')}
            </p>
            <p className="font-semibold text-base sm:text-lg text-slate-800">
              {t('emergency.explanation')}
            </p>
          </div>

          {/* Location Direction */}
          <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl flex items-start gap-3">
            <MapPinIcon className="w-7 h-7 text-hospital-700 flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-lg text-hospital-900">
                {t('emergency.locationGuide')}
              </p>
              <p className="text-slate-700 mt-1 text-base">
                Room E1 • Ground Floor • Near Gate 1
              </p>
            </div>
          </div>

          {/* Emergency Mini SVG Route Diagram */}
          <div className="border-2 border-slate-300 rounded-xl p-3 bg-slate-50 text-center">
            <p className="font-bold text-sm text-slate-600 mb-2">Ground Floor Path to Emergency (Casualty):</p>
            <svg viewBox="0 0 320 100" className="w-full h-24 max-w-sm mx-auto" aria-label="Route to Emergency diagram">
              {/* Gate 1 */}
              <rect x="220" y="25" width="85" height="50" rx="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
              <text x="262" y="55" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#1e293b">Gate 1</text>

              {/* Path Arrow */}
              <path d="M 220 50 L 115 50" stroke="#dc2626" strokeWidth="4" strokeDasharray="6 4" />
              <polygon points="115,45 105,50 115,55" fill="#dc2626" />

              {/* Casualty */}
              <rect x="15" y="20" width="90" height="60" rx="8" fill="#fee2e2" stroke="#dc2626" strokeWidth="3" />
              <text x="60" y="47" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#991b1b">Casualty</text>
              <text x="60" y="65" fontSize="10" textAnchor="middle" fill="#7f1d1d">Room E1</text>
            </svg>
          </div>

          {/* Emergency Calling Buttons */}
          <div className="space-y-2 pt-2">
            <p className="font-bold text-slate-800 text-base">{t('emergency.helplineTitle')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href="tel:112"
                className="min-h-[56px] px-4 py-3 bg-emergency-600 hover:bg-emergency-700 active:bg-emergency-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-lg shadow focus:ring-4 focus:ring-amber-300 focus:outline-none"
              >
                <PhoneIcon className="w-6 h-6" />
                <span>112 (National)</span>
              </a>
              <a
                href="tel:108"
                className="min-h-[56px] px-4 py-3 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-lg shadow focus:ring-4 focus:ring-amber-300 focus:outline-none"
              >
                <PhoneIcon className="w-6 h-6" />
                <span>108 (Ambulance)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 p-4 border-t-2 border-slate-200 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={handleOpenMap}
            className="min-h-[56px] flex-1 px-4 py-3 bg-hospital-600 hover:bg-hospital-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-lg shadow focus:ring-4 focus:ring-amber-300 focus:outline-none"
          >
            <MapPinIcon className="w-6 h-6" />
            <span>{t('emergency.viewMap')}</span>
          </button>
          <button
            type="button"
            onClick={() => setEmergencyModalOpen(false)}
            className="min-h-[56px] px-6 py-3 bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-2 text-lg focus:ring-4 focus:ring-slate-500 focus:outline-none"
          >
            <span>{t('emergency.close')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

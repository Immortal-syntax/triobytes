import React, { useState } from 'react';
import { useI18n } from '../../context/I18nContext.jsx';
import { useHospital } from '../../context/HospitalContext.jsx';
import { AlertIcon, CheckCircleIcon, CloseIcon, PhoneIcon } from './Icons.jsx';

export default function UrgentHelpModal() {
  const { t } = useI18n();
  const { urgentHelpModalOpen, setUrgentHelpModalOpen, raiseUrgentHelpAlert } = useHospital();
  const [alertSent, setAlertSent] = useState(false);

  if (!urgentHelpModalOpen) return null;

  const handleConfirmAlert = () => {
    raiseUrgentHelpAlert({ notes: 'Patient tapped urgent assistance alert button' });
    setAlertSent(true);
  };

  const handleClose = () => {
    setAlertSent(false);
    setUrgentHelpModalOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="urgent-help-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border-4 border-emergency-600 rounded-2xl shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="bg-emergency-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertIcon className="w-8 h-8 text-amber-300 animate-bounce" />
            <h2 id="urgent-help-title" className="text-xl sm:text-2xl font-black">
              {alertSent ? t('urgentHelp.alertSentTitle') : t('urgentHelp.modalTitle')}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="min-h-[48px] min-w-[48px] p-2 bg-emergency-900 text-white rounded-lg focus:ring-4 focus:ring-white focus:outline-none flex items-center justify-center"
            aria-label="Close"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {!alertSent ? (
            <>
              <p className="text-slate-800 dark:text-slate-100 font-semibold text-lg leading-relaxed">
                {t('urgentHelp.modalBody')}
              </p>

              <div className="bg-amber-50 border-2 border-amber-300 p-3 rounded-xl text-amber-900 text-base">
                ⚠️ {t('emergency.urgentNotice')}
              </div>

              <div className="space-y-3 pt-2">
                <button
                  id="btn-confirm-alert-staff"
                  type="button"
                  onClick={handleConfirmAlert}
                  className="w-full min-h-[56px] px-6 py-3 bg-emergency-600 hover:bg-emergency-700 active:bg-emergency-800 text-white font-extrabold text-xl rounded-xl flex items-center justify-center gap-3 shadow-lg focus:ring-4 focus:ring-amber-300 focus:outline-none"
                >
                  <AlertIcon className="w-7 h-7" />
                  <span>{t('urgentHelp.confirmBtn')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full min-h-[56px] px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-lg rounded-xl flex items-center justify-center gap-2 focus:ring-4 focus:ring-slate-500 focus:outline-none"
                >
                  <span>{t('urgentHelp.cancelBtn')}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 bg-success-100 text-success-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircleIcon className="w-10 h-10" />
              </div>

              <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-xl text-emerald-950 text-left space-y-2">
                <p className="font-extrabold text-lg sm:text-xl">
                  {t('urgentHelp.alertSentBody')}
                </p>
                <p className="font-semibold text-base text-emerald-800">
                  🔔 {t('urgentHelp.soundNotice')}
                </p>
              </div>

              <a
                href="tel:112"
                className="w-full min-h-[56px] px-4 py-3 bg-emergency-600 hover:bg-emergency-700 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow focus:ring-4 focus:ring-amber-300 focus:outline-none"
              >
                <PhoneIcon className="w-6 h-6" />
                <span>Call 112 (Immediate Help)</span>
              </a>

              <button
                type="button"
                onClick={handleClose}
                className="w-full min-h-[56px] px-6 py-3 bg-slate-800 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 focus:ring-4 focus:ring-slate-500 focus:outline-none"
              >
                <span>{t('emergency.close')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

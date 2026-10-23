import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n/useT.js';
import { useHospital } from '../context/HospitalContext.jsx';
import {
  EmergencyCrossIcon,
  PhoneIcon,
  MapPinIcon,
  AlertIcon,
  InfoIcon,
} from '../components/common/Icons.jsx';
import FloorSvgMap from '../components/map/FloorSvgMap.jsx';

export default function EmergencyPage() {
  const { t } = useT();
  const { setUrgentHelpModalOpen } = useHospital();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* 1. Header Alert Banner */}
      <div className="bg-emergency-600 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-emergency-800 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white text-emergency-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <EmergencyCrossIcon className="w-12 h-12 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {t('emergency.title')}
            </h2>
            <p className="text-lg sm:text-xl font-bold text-amber-200 mt-1">
              {t('emergency.urgentNotice')}
            </p>
          </div>
        </div>

        <p className="text-base sm:text-lg text-white font-medium bg-emergency-800/80 p-4 rounded-xl border border-emergency-500">
          {t('emergency.explanation')}
        </p>
      </div>

      {/* 2. Direct Emergency Call Actions */}
      <div className="space-y-3">
        <p className="font-bold text-lg text-slate-800 dark:text-slate-200">
          {t('emergency.helplineTitle')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="tel:112"
            className="min-h-[64px] px-6 py-3 bg-emergency-600 hover:bg-emergency-700 active:bg-emergency-800 text-white font-black text-xl rounded-2xl flex items-center justify-center gap-3 shadow-lg focus:ring-4 focus:ring-amber-300 focus:outline-none"
          >
            <PhoneIcon className="w-7 h-7" />
            <span>112 (National Helpline)</span>
          </a>

          <a
            href="tel:108"
            className="min-h-[64px] px-6 py-3 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-black text-xl rounded-2xl flex items-center justify-center gap-3 shadow-lg focus:ring-4 focus:ring-amber-300 focus:outline-none"
          >
            <PhoneIcon className="w-7 h-7" />
            <span>108 (Ambulance)</span>
          </a>
        </div>
      </div>

      {/* 3. Urgent Assistance Button (Sounds Alarm on Staff Dashboard) */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border-3 border-amber-400 dark:border-amber-600 rounded-2xl p-5 sm:p-6 space-y-3">
        <h3 className="text-xl font-black text-amber-950 dark:text-amber-100 flex items-center gap-2">
          <AlertIcon className="w-7 h-7 text-emergency-600" />
          <span>Need immediate help right where you are?</span>
        </h3>
        <p className="text-base text-amber-900 dark:text-amber-200 font-medium">
          If you or someone near you cannot walk or needs assistance, press below to alert the staff desk right away.
        </p>
        <button
          id="btn-emergency-raise-help"
          type="button"
          onClick={() => setUrgentHelpModalOpen(true)}
          className="w-full min-h-[56px] px-6 py-3 bg-emergency-700 hover:bg-emergency-800 active:bg-emergency-900 text-white font-black text-xl rounded-xl flex items-center justify-center gap-2 shadow-md focus:ring-4 focus:ring-amber-300 focus:outline-none"
        >
          <AlertIcon className="w-6 h-6" />
          <span>{t('urgentHelp.button')}</span>
        </button>
      </div>

      {/* 4. Location Guide & Map to Casualty (Room E1) */}
      <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <MapPinIcon className="w-8 h-8 text-emergency-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Casualty Location Guide
            </h3>
            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 font-semibold mt-1">
              {t('emergency.locationGuide')}
            </p>
          </div>
        </div>

        {/* Floor 0 Map with Emergency Route */}
        <FloorSvgMap
          floor={0}
          activeNodeId="casualty"
          activePath={['gate_1', 'g_lobby', 'casualty']}
          onSelectNode={() => {}}
        />

        <button
          type="button"
          onClick={() => navigate('/find?dest=casualty')}
          className="w-full min-h-[56px] px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 focus:ring-4 focus:ring-hospital-400 focus:outline-none"
        >
          <MapPinIcon className="w-6 h-6" />
          <span>Open Full Hospital Map</span>
        </button>
      </div>
    </div>
  );
}

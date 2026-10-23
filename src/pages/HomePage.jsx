import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n/useT.js';
import { useHospital } from '../context/HospitalContext.jsx';
import {
  TicketIcon,
  ClockIcon,
  MapPinIcon,
  SearchIcon,
  EmergencyCrossIcon,
  UserIcon,
  InfoIcon,
} from '../components/common/Icons.jsx';

export default function HomePage() {
  const { t } = useT();
  const { loadKamlaDemo } = useHospital();
  const navigate = useNavigate();

  const handleKamlaDemo = () => {
    const kamla = loadKamlaDemo();
    navigate(`/slip/${kamla.tokenCode}`);
  };

  return (
    <div className="space-y-6">
      {/* Educational 1-Line Hospital Definitions Banner */}
      <div className="bg-white dark:bg-slate-800 border-2 border-hospital-200 dark:border-hospital-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
        <div className="flex items-start gap-3">
          <InfoIcon className="w-6 h-6 text-hospital-600 dark:text-hospital-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-slate-800 dark:text-slate-200 text-base sm:text-lg">
            <p className="font-semibold">
              <span className="font-black text-hospital-700 dark:text-hospital-300">OPD: </span>
              {t('def.opd')}
            </p>
            <p className="font-semibold text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700 pt-1.5">
              <span className="font-black text-hospital-700 dark:text-hospital-300">Token: </span>
              {t('def.token')}
            </p>
            <p className="font-semibold text-emergency-700 dark:text-emergency-300 border-t border-slate-100 dark:border-slate-700 pt-1.5">
              <span className="font-black text-emergency-800 dark:text-emergency-200">Casualty: </span>
              {t('def.casualty')}
            </p>
          </div>
        </div>
      </div>

      {/* Greeting */}
      <div className="text-center sm:text-left space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {t('home.welcome')}
        </h2>
        <p className="text-lg text-slate-700 dark:text-slate-300 font-medium">
          {t('home.instruction')}
        </p>
      </div>

      {/* FOUR BIG BUTTONS (CRITICAL REQUIREMENT 6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Register Button */}
        <div className="bg-white dark:bg-slate-800 border-3 border-hospital-500 rounded-2xl p-5 shadow-md flex flex-col justify-between hover:border-hospital-600 transition-all">
          <div className="space-y-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-hospital-100 dark:bg-hospital-950 text-hospital-700 dark:text-hospital-300 flex items-center justify-center">
              <TicketIcon className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-hospital-900 dark:text-white">
              {t('home.registerTitle')}
            </h3>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              {t('home.registerDesc')}
            </p>
          </div>
          <button
            id="btn-home-register-big"
            type="button"
            onClick={() => navigate('/register')}
            className="w-full min-h-[56px] px-6 py-3 bg-hospital-600 hover:bg-hospital-700 active:bg-hospital-800 text-white font-black text-xl rounded-xl flex items-center justify-center gap-3 shadow-lg focus:ring-4 focus:ring-amber-300 focus:outline-none transition-transform active:scale-95"
          >
            <TicketIcon className="w-7 h-7 flex-shrink-0" />
            <span>{t('home.registerBtn')}</span>
          </button>
        </div>

        {/* 2. I have my slip Button */}
        <div className="bg-white dark:bg-slate-800 border-3 border-slate-300 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-400 transition-all">
          <div className="space-y-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center">
              <ClockIcon className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t('home.haveSlipTitle')}
            </h3>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              {t('home.haveSlipDesc')}
            </p>
          </div>
          <button
            id="btn-home-have-slip-big"
            type="button"
            onClick={() => navigate('/have-slip')}
            className="w-full min-h-[56px] px-6 py-3 bg-slate-800 hover:bg-slate-900 active:bg-black text-white font-black text-xl rounded-xl flex items-center justify-center gap-3 shadow focus:ring-4 focus:ring-amber-300 focus:outline-none transition-transform active:scale-95"
          >
            <ClockIcon className="w-7 h-7 flex-shrink-0" />
            <span>{t('home.haveSlipBtn')}</span>
          </button>
        </div>

        {/* 3. Find a place Button */}
        <div className="bg-white dark:bg-slate-800 border-3 border-emerald-300 dark:border-emerald-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-emerald-500 transition-all">
          <div className="space-y-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <SearchIcon className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t('home.findPlaceTitle')}
            </h3>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              {t('home.findPlaceDesc')}
            </p>
          </div>
          <button
            id="btn-home-find-place-big"
            type="button"
            onClick={() => navigate('/find')}
            className="w-full min-h-[56px] px-6 py-3 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-black text-xl rounded-xl flex items-center justify-center gap-3 shadow focus:ring-4 focus:ring-amber-300 focus:outline-none transition-transform active:scale-95"
          >
            <SearchIcon className="w-7 h-7 flex-shrink-0" />
            <span>{t('home.findPlaceBtn')}</span>
          </button>
        </div>

        {/* 4. Emergency Button */}
        <div className="bg-emergency-50 dark:bg-emergency-950/40 border-3 border-emergency-500 rounded-2xl p-5 shadow-md flex flex-col justify-between hover:border-emergency-600 transition-all">
          <div className="space-y-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emergency-100 dark:bg-emergency-900 text-emergency-700 dark:text-emergency-200 flex items-center justify-center">
              <EmergencyCrossIcon className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-emergency-950 dark:text-emergency-100">
              {t('home.emergencyTitle')}
            </h3>
            <p className="text-base sm:text-lg text-emergency-900 dark:text-emergency-200 font-semibold">
              {t('home.emergencyDesc')}
            </p>
          </div>
          <button
            id="btn-home-emergency-big"
            type="button"
            onClick={() => navigate('/emergency')}
            className="w-full min-h-[56px] px-6 py-3 bg-emergency-600 hover:bg-emergency-700 active:bg-emergency-800 text-white font-black text-xl rounded-xl flex items-center justify-center gap-3 shadow-lg focus:ring-4 focus:ring-amber-300 focus:outline-none transition-transform active:scale-95"
          >
            <EmergencyCrossIcon className="w-7 h-7 flex-shrink-0" />
            <span>{t('home.emergencyBtn')}</span>
          </button>
        </div>
      </div>

      {/* Focus Persona: Kamla Devi Demo Box */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-block px-3 py-1 bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-full font-black text-xs uppercase tracking-wide">
            ⭐ Focus Persona Demo
          </span>
          <h4 className="text-xl sm:text-2xl font-black text-amber-950 dark:text-amber-100">
            {t('home.kamlaDemoTitle')}
          </h4>
          <p className="text-base text-amber-900 dark:text-amber-200 font-medium">
            {t('home.kamlaDemoDesc')}
          </p>
        </div>
        <button
          id="btn-load-kamla-demo"
          type="button"
          onClick={handleKamlaDemo}
          className="w-full sm:w-auto min-h-[56px] px-6 py-3 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow focus:ring-4 focus:ring-slate-800 focus:outline-none flex-shrink-0"
        >
          <UserIcon className="w-6 h-6" />
          <span>{t('home.kamlaDemoBtn')}</span>
        </button>
      </div>
    </div>
  );
}

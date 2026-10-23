import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../context/I18nContext.jsx';
import { useHospital } from '../context/HospitalContext.jsx';
import {
  TicketIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  InfoIcon,
  TvIcon,
  StaffBadgeIcon,
} from '../components/common/Icons.jsx';

export default function HomePage() {
  const { t } = useI18n();
  const { loadKamlaDemo } = useHospital();
  const navigate = useNavigate();

  const handleKamlaDemo = () => {
    loadKamlaDemo();
    navigate('/slip');
  };

  return (
    <div className="space-y-6">
      {/* Educational 1-Line Hospital Definition Banner */}
      <div className="bg-white dark:bg-slate-800 border-2 border-hospital-200 dark:border-hospital-800 rounded-2xl p-4 shadow-sm space-y-2">
        <div className="flex items-start gap-2.5">
          <InfoIcon className="w-6 h-6 text-hospital-600 dark:text-hospital-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1.5 text-slate-800 dark:text-slate-200">
            <p className="font-semibold text-base sm:text-lg">
              <span className="font-bold text-hospital-700 dark:text-hospital-300">OPD: </span>
              {t('def.opd')}
            </p>
            <p className="font-semibold text-base sm:text-lg text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700 pt-1.5">
              <span className="font-bold text-hospital-700 dark:text-hospital-300">Token: </span>
              {t('def.token')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Patient Welcome & Instruction */}
      <div className="text-center sm:text-left space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {t('home.welcome')}
        </h2>
        <p className="text-lg text-slate-700 dark:text-slate-300 font-medium">
          {t('home.instruction')}
        </p>
      </div>

      {/* Primary Action 1: Get New OPD Slip */}
      <div className="bg-white dark:bg-slate-800 border-3 border-hospital-500 rounded-2xl p-5 sm:p-6 shadow-md hover:border-hospital-600 transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-hospital-100 dark:bg-hospital-950 text-hospital-800 dark:text-hospital-300 rounded-full font-bold text-sm">
              <TicketIcon className="w-4 h-4" />
              <span>Recommended First Step</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-hospital-900 dark:text-white">
              {t('home.quickRegisterTitle')}
            </h3>
            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300">
              {t('home.quickRegisterDesc')}
            </p>
          </div>
          <button
            id="btn-home-register"
            type="button"
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto min-h-[56px] px-8 py-3 bg-hospital-600 hover:bg-hospital-700 active:bg-hospital-800 text-white font-extrabold text-xl rounded-xl flex items-center justify-center gap-3 shadow-lg focus:ring-4 focus:ring-amber-300 focus:outline-none flex-shrink-0"
          >
            <TicketIcon className="w-7 h-7" />
            <span>{t('home.quickRegisterBtn')}</span>
          </button>
        </div>
      </div>

      {/* Action 2: Check Existing Token */}
      <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {t('home.haveTokenTitle')}
            </h3>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              {t('home.haveTokenDesc')}
            </p>
          </div>
          <button
            id="btn-home-queue"
            type="button"
            onClick={() => navigate('/queue')}
            className="w-full sm:w-auto min-h-[56px] px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow focus:ring-4 focus:ring-amber-300 focus:outline-none flex-shrink-0"
          >
            <ClockIcon className="w-6 h-6" />
            <span>{t('home.haveTokenBtn')}</span>
          </button>
        </div>
      </div>

      {/* Special Demo Box for Kamla (Main Persona) */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-full font-black text-xs uppercase tracking-wide">
              ⭐ Hackathon Focus Persona
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-amber-950 dark:text-amber-200">
              {t('home.kamlaDemoTitle')}
            </h3>
            <p className="text-base sm:text-lg text-amber-900 dark:text-amber-100 font-medium">
              {t('home.kamlaDemoDesc')}
            </p>
          </div>
          <button
            id="btn-load-kamla-demo"
            type="button"
            onClick={handleKamlaDemo}
            className="w-full sm:w-auto min-h-[56px] px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow focus:ring-4 focus:ring-slate-800 focus:outline-none flex-shrink-0"
          >
            <UserIcon className="w-6 h-6" />
            <span>{t('home.kamlaDemoBtn')}</span>
          </button>
        </div>
      </div>

      {/* Action 3: Hospital Map */}
      <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {t('home.hospitalMapTitle')}
            </h3>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              {t('home.hospitalMapDesc')}
            </p>
          </div>
          <button
            id="btn-home-map"
            type="button"
            onClick={() => navigate('/map')}
            className="w-full sm:w-auto min-h-[56px] px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow focus:ring-4 focus:ring-amber-300 focus:outline-none flex-shrink-0"
          >
            <MapPinIcon className="w-6 h-6" />
            <span>{t('home.hospitalMapBtn')}</span>
          </button>
        </div>
      </div>

      {/* Quick Links for Hospital Staff & Lobby TV Display */}
      <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => navigate('/staff')}
          className="min-h-[56px] p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-300 dark:border-slate-600 flex items-center gap-3 text-left focus:ring-4 focus:ring-hospital-400 focus:outline-none"
        >
          <StaffBadgeIcon className="w-7 h-7 text-hospital-700 dark:text-hospital-400 flex-shrink-0" />
          <div>
            <p className="font-bold text-base text-slate-900 dark:text-white">{t('nav.staff')}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Doctor & desk queue controls</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/display')}
          className="min-h-[56px] p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-300 dark:border-slate-600 flex items-center gap-3 text-left focus:ring-4 focus:ring-hospital-400 focus:outline-none"
        >
          <TvIcon className="w-7 h-7 text-purple-700 dark:text-purple-400 flex-shrink-0" />
          <div>
            <p className="font-bold text-base text-slate-900 dark:text-white">{t('nav.display')}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Waiting hall token display screen</p>
          </div>
        </button>
      </div>
    </div>
  );
}

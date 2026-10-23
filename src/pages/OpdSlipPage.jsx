import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../context/I18nContext.jsx';
import { useHospital } from '../context/HospitalContext.jsx';
import { getDepartmentById } from '../data/departments.js';
import {
  TicketIcon,
  ClockIcon,
  MapPinIcon,
  PrinterIcon,
  CheckCircleIcon,
  InfoIcon,
} from '../components/common/Icons.jsx';

export default function OpdSlipPage() {
  const { t } = useI18n();
  const { myToken, queues } = useHospital();
  const navigate = useNavigate();

  if (!myToken) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
          No active OPD slip found. Please register or load the sample demo.
        </p>
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="min-h-[56px] px-6 py-3 bg-hospital-600 text-white font-bold rounded-xl"
        >
          {t('home.quickRegisterBtn')}
        </button>
      </div>
    );
  }

  const dept = getDepartmentById(myToken.deptId);
  const currentQ = queues[myToken.deptId] || { currentToken: 1, tokens: [] };

  // Calculate waiting count ahead
  const waitingTokens = currentQ.tokens.filter(
    (tk) => tk.status === 'waiting' && tk.tokenNumber < myToken.tokenNumber
  );
  const peopleAhead = waitingTokens.length;

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-10">
      {/* Educational 1-Line Definition */}
      <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-3 flex items-start gap-2 text-blue-900 dark:text-blue-200 text-base">
        <InfoIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="font-semibold">{t('def.token')}</p>
      </div>

      {/* Printable OPD Slip Paper Card */}
      <div
        id="printable-slip"
        className="bg-white dark:bg-slate-900 border-4 border-slate-900 dark:border-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden"
      >
        {/* Hospital Watermark & Header */}
        <div className="border-b-4 border-dashed border-slate-300 dark:border-slate-700 pb-5 text-center space-y-1">
          <p className="font-black text-xs sm:text-sm tracking-widest text-hospital-700 dark:text-hospital-400 uppercase">
            Government of NCT • Health Services
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t('hospital.name')}
          </h2>
          <p className="text-base font-bold text-slate-600 dark:text-slate-300">
            {t('slip.title')} • {t('slip.fee')}
          </p>
        </div>

        {/* Huge Token Display Box */}
        <div className="bg-hospital-50 dark:bg-hospital-950/80 border-4 border-hospital-600 rounded-2xl p-6 text-center space-y-2">
          <p className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-hospital-800 dark:text-hospital-300">
            {t('slip.tokenLabel')}
          </p>
          <p className="text-5xl sm:text-6xl font-black text-hospital-900 dark:text-white tracking-tight">
            {myToken.tokenCode}
          </p>
          <p className="text-sm font-bold text-hospital-700 dark:text-hospital-300">
            Issued at: {myToken.timeIssued} • {myToken.dateIssued}
          </p>
        </div>

        {/* Key Patient & Clinic Details Table */}
        <div className="divide-y-2 divide-slate-200 dark:divide-slate-800 text-lg">
          <div className="py-2.5 flex justify-between">
            <span className="font-bold text-slate-600 dark:text-slate-400">{t('slip.patientName')}:</span>
            <span className="font-black text-slate-900 dark:text-white text-xl">{myToken.patientName}</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="font-bold text-slate-600 dark:text-slate-400">{t('slip.age')}:</span>
            <span className="font-extrabold text-slate-900 dark:text-white">{myToken.age} Yrs ({myToken.gender})</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="font-bold text-slate-600 dark:text-slate-400">{t('slip.department')}:</span>
            <span className="font-black text-hospital-700 dark:text-hospital-300 text-right">{t(dept.nameKey)}</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="font-bold text-slate-600 dark:text-slate-400">{t('slip.doctor')}:</span>
            <span className="font-bold text-slate-900 dark:text-white">{dept.doctorName}</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="font-bold text-slate-600 dark:text-slate-400">{t('slip.room')}:</span>
            <span className="font-black text-xl text-amber-800 dark:text-amber-300">Room {dept.room} ({t(dept.floorKey)})</span>
          </div>
        </div>

        {/* Live Wait Status Indicator */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="font-bold text-amber-900 dark:text-amber-200 text-base">
              {t('slip.waitingAhead')}
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Current Token in Doctor Room: <span className="font-bold">{dept.id.slice(0, 4).toUpperCase()}-{currentQ.currentToken}</span>
            </p>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-amber-900 dark:text-amber-200 px-3 py-1 bg-amber-200 dark:bg-amber-800 rounded-xl">
            {peopleAhead}
          </div>
        </div>

        {/* Simulated Barcode / QR Code for Hospital Reader */}
        <div className="border-t-4 border-dashed border-slate-300 dark:border-slate-700 pt-5 text-center space-y-2">
          <p className="text-xs text-slate-500 font-bold uppercase">{t('slip.qrHelp')}</p>
          <svg className="w-48 h-14 mx-auto" viewBox="0 0 160 40" aria-label="Token Barcode">
            <rect x="0" y="0" width="160" height="40" fill="#ffffff" />
            <path
              d="M10 5 v30 M15 5 v30 M22 5 v30 M25 5 v30 M32 5 v30 M36 5 v30 M45 5 v30 M52 5 v30 M60 5 v30 M68 5 v30 M75 5 v30 M82 5 v30 M90 5 v30 M98 5 v30 M105 5 v30 M114 5 v30 M122 5 v30 M130 5 v30 M140 5 v30 M150 5 v30"
              stroke="#000000"
              strokeWidth="3.5"
            />
          </svg>
          <p className="font-mono text-xs font-bold tracking-widest text-slate-700">{myToken.tokenCode}</p>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="space-y-3">
        {/* Track Live Queue Button */}
        <button
          id="btn-track-live-queue"
          type="button"
          onClick={() => navigate('/queue')}
          className="w-full min-h-[56px] py-3 px-6 bg-hospital-600 hover:bg-hospital-700 active:bg-hospital-800 text-white font-extrabold text-xl rounded-2xl flex items-center justify-center gap-3 shadow-lg focus:ring-4 focus:ring-amber-300 focus:outline-none"
        >
          <ClockIcon className="w-7 h-7" />
          <span>{t('slip.trackBtn')}</span>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Find Room on Map */}
          <button
            id="btn-slip-view-map"
            type="button"
            onClick={() => navigate(`/map?dest=${dept.nodeId}`)}
            className="min-h-[56px] py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow focus:ring-4 focus:ring-amber-300 focus:outline-none"
          >
            <MapPinIcon className="w-6 h-6" />
            <span>{t('slip.mapBtn')}</span>
          </button>

          {/* Print / Save Slip */}
          <button
            id="btn-slip-print"
            type="button"
            onClick={() => window.print()}
            className="min-h-[56px] py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow focus:ring-4 focus:ring-amber-300 focus:outline-none"
          >
            <PrinterIcon className="w-6 h-6" />
            <span>{t('slip.printBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

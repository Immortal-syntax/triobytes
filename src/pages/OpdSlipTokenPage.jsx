import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useT } from '../i18n/useT.js';
import { useHospital } from '../context/HospitalContext.jsx';
import { getDepartmentById, DEPARTMENTS } from '../data/departments.js';
import {
  TicketIcon,
  ClockIcon,
  MapPinIcon,
  PrinterIcon,
  InfoIcon,
} from '../components/common/Icons.jsx';

export default function OpdSlipTokenPage() {
  const { token } = useParams();
  const { t } = useT();
  const { myToken, queues, loadKamlaDemo } = useHospital();
  const navigate = useNavigate();

  // Find token object from queues or use active token
  const tokenData = useMemo(() => {
    const searchCode = (token || '').toUpperCase();
    if (!searchCode && myToken) return myToken;

    for (const q of Object.values(queues)) {
      const match = q.tokens.find((tk) => tk.tokenCode.toUpperCase() === searchCode);
      if (match) {
        return {
          ...match,
          deptId: q.deptId,
          room: getDepartmentById(q.deptId).room,
          floor: getDepartmentById(q.deptId).floor,
          doctorName: getDepartmentById(q.deptId).doctorName,
        };
      }
    }

    if (searchCode.startsWith('ORTHO')) {
      return {
        tokenNumber: 14,
        tokenCode: searchCode,
        patientName: 'Kamla',
        age: 62,
        gender: 'female',
        deptId: 'ortho',
        room: 'R101',
        floor: 1,
        doctorName: 'Dr. Anand Kulkarni',
        timeIssued: '09:20 AM',
        dateIssued: new Date().toLocaleDateString(),
      };
    }

    return myToken || {
      tokenNumber: 14,
      tokenCode: 'ORTHO-14',
      patientName: 'Kamla',
      age: 62,
      gender: 'female',
      deptId: 'ortho',
      room: 'R101',
      floor: 1,
      doctorName: 'Dr. Anand Kulkarni',
      timeIssued: '09:20 AM',
      dateIssued: new Date().toLocaleDateString(),
    };
  }, [token, myToken, queues]);

  const dept = getDepartmentById(tokenData.deptId);
  const currentQ = queues[tokenData.deptId] || { currentToken: 1, tokens: [] };
  const waitingTokens = currentQ.tokens.filter(
    (tk) => tk.status === 'waiting' && tk.tokenNumber < tokenData.tokenNumber
  );
  const peopleAhead = waitingTokens.length;

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12">
      {/* 1-Line Definition */}
      <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-3 flex items-start gap-2 text-blue-900 dark:text-blue-200 text-base">
        <InfoIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="font-semibold">{t('def.token')}</p>
      </div>

      {/* Printable OPD Slip Paper Card */}
      <div
        id="printable-slip"
        className="bg-white dark:bg-slate-900 border-4 border-slate-900 dark:border-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden"
      >
        {/* Hospital Header */}
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

        {/* Large Token Box */}
        <div className="bg-hospital-50 dark:bg-hospital-950/80 border-4 border-hospital-600 rounded-2xl p-6 text-center space-y-2">
          <p className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-hospital-800 dark:text-hospital-300">
            {t('slip.tokenLabel')}
          </p>
          <p className="text-5xl sm:text-6xl font-black text-hospital-900 dark:text-white tracking-tight">
            {tokenData.tokenCode}
          </p>
          <p className="text-sm font-bold text-hospital-700 dark:text-hospital-300">
            Issued at: {tokenData.timeIssued} • {tokenData.dateIssued}
          </p>
        </div>

        {/* Details Table */}
        <div className="divide-y-2 divide-slate-200 dark:divide-slate-800 text-lg">
          <div className="py-2.5 flex justify-between">
            <span className="font-bold text-slate-600 dark:text-slate-400">{t('slip.patientName')}:</span>
            <span className="font-black text-slate-900 dark:text-white text-xl">{tokenData.patientName}</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="font-bold text-slate-600 dark:text-slate-400">{t('slip.age')}:</span>
            <span className="font-extrabold text-slate-900 dark:text-white">{tokenData.age} Yrs</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="font-bold text-slate-600 dark:text-slate-400">{t('slip.department')}:</span>
            <span className="font-black text-hospital-700 dark:text-hospital-300 text-right">{t(dept.nameKey)}</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="font-bold text-slate-600 dark:text-slate-400">{t('slip.doctor')}:</span>
            <span className="font-bold text-slate-900 dark:text-white">{tokenData.doctorName || dept.doctorName}</span>
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
              Current in Doctor Room: <span className="font-bold">{dept.id.slice(0, 4).toUpperCase()}-{currentQ.currentToken}</span>
            </p>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-amber-900 dark:text-amber-200 px-3 py-1 bg-amber-200 dark:bg-amber-800 rounded-xl">
            {peopleAhead}
          </div>
        </div>

        {/* Barcode Graphic */}
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
          <p className="font-mono text-xs font-bold tracking-widest text-slate-700">{tokenData.tokenCode}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          id="btn-slip-track-turn"
          type="button"
          onClick={() => navigate(`/turn/${tokenData.tokenCode}`)}
          className="w-full min-h-[56px] py-3 px-6 bg-hospital-600 hover:bg-hospital-700 active:bg-hospital-800 text-white font-black text-xl rounded-2xl flex items-center justify-center gap-3 shadow-lg focus:ring-4 focus:ring-amber-300 focus:outline-none"
        >
          <ClockIcon className="w-7 h-7" />
          <span>Track Live Turn ({tokenData.tokenCode})</span>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate(`/find?dest=${dept.nodeId}`)}
            className="min-h-[56px] py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow focus:ring-4 focus:ring-amber-300 focus:outline-none"
          >
            <MapPinIcon className="w-6 h-6" />
            <span>Find Room {dept.room}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-[56px] py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow focus:ring-4 focus:ring-slate-500 focus:outline-none"
          >
            <PrinterIcon className="w-6 h-6" />
            <span>{t('slip.printBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

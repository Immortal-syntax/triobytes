import React, { useState, useEffect } from 'react';
import { useI18n } from '../context/I18nContext.jsx';
import { useHospital } from '../context/HospitalContext.jsx';
import { DEPARTMENTS } from '../data/departments.js';
import { TvIcon, ClockIcon, EmergencyCrossIcon } from '../components/common/Icons.jsx';

export default function TvDisplayPage() {
  const { t } = useI18n();
  const { queues } = useHospital();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-slate-950 text-white min-h-[90vh] -mx-4 -my-6 p-4 sm:p-8 space-y-6">
      {/* TV Header Bar */}
      <div className="border-b-4 border-hospital-600 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-hospital-600 flex items-center justify-center font-black text-3xl">
            🏥
          </div>
          <div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-wide text-white">
              {t('hospital.name')}
            </h2>
            <p className="text-base sm:text-xl font-bold text-hospital-400">
              {t('display.title')} • {t('display.subtitle')}
            </p>
          </div>
        </div>

        {/* Digital Clock */}
        <div className="bg-slate-900 border-2 border-slate-700 px-6 py-2 rounded-2xl flex items-center gap-3 shadow-inner">
          <ClockIcon className="w-8 h-8 text-amber-400" />
          <span className="text-3xl sm:text-4xl font-mono font-black text-amber-300">
            {currentTime}
          </span>
        </div>
      </div>

      {/* Grid of All Departments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {DEPARTMENTS.map((dept) => {
          const q = queues[dept.id] || { currentToken: 1, doctorStatus: 'available', tokens: [] };
          const waitingTokens = q.tokens.filter((tk) => tk.status === 'waiting');
          const nextTokenCode = waitingTokens.length > 0 ? waitingTokens[0].tokenCode : '---';

          return (
            <div
              key={dept.id}
              className="bg-slate-900 border-3 border-slate-700 rounded-3xl p-5 shadow-2xl flex flex-col justify-between space-y-4 hover:border-hospital-500 transition-colors"
            >
              {/* Dept Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-800 pb-3">
                <div>
                  <h3 className="text-xl font-black text-white line-clamp-1">
                    {t(dept.nameKey)}
                  </h3>
                  <p className="text-sm font-bold text-slate-400">
                    {dept.doctorName}
                  </p>
                </div>
                <div className="px-3 py-1 bg-hospital-800 text-hospital-200 rounded-xl font-black text-base border border-hospital-600">
                  {dept.room}
                </div>
              </div>

              {/* Large Current Token Calling Box */}
              <div className="bg-slate-950 border-3 border-hospital-500 rounded-2xl p-4 text-center space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-hospital-400">
                  {t('display.serving')}
                </span>
                <p className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight">
                  {dept.id.slice(0, 4).toUpperCase()}-{q.currentToken}
                </p>
                <span className="text-xs font-bold text-slate-400">
                  {t(dept.floorKey)}
                </span>
              </div>

              {/* Next Up & Status */}
              <div className="flex items-center justify-between text-base pt-1">
                <div>
                  <span className="text-xs font-bold text-slate-400 block">{t('display.next')}</span>
                  <span className="font-extrabold text-white text-lg">{nextTokenCode}</span>
                </div>
                <div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      q.doctorStatus === 'available'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                        : 'bg-amber-950 text-amber-400 border border-amber-700'
                    }`}
                  >
                    {q.doctorStatus === 'available' ? 'Consulting' : 'Short Break'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency Always-On TV Footer */}
      <div className="bg-emergency-900 border-3 border-emergency-600 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-lg">
        <div className="flex items-center gap-3">
          <EmergencyCrossIcon className="w-10 h-10 text-white animate-pulse flex-shrink-0" />
          <div>
            <p className="font-black text-lg sm:text-xl text-white">
              Emergency & Casualty: Ground Floor, Room E1 (Straight from Gate 1)
            </p>
            <p className="text-sm font-semibold text-emergency-200">
              No registration or waiting needed for serious accidents or acute medical distress.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xl font-black text-amber-300">
          <span>🚨 Call 112 / 108</span>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useT } from '../i18n/useT.js';
import { useHospital } from '../context/HospitalContext.jsx';
import { DEPARTMENTS, getDepartmentById } from '../data/departments.js';
import {
  StaffBadgeIcon,
  ClockIcon,
  VolumeIcon,
  AlertIcon,
  CheckCircleIcon,
} from '../components/common/Icons.jsx';

export default function StaffCounterPage() {
  const { t } = useT();
  const {
    queues,
    urgentAlerts,
    dismissUrgentAlert,
    callNextPatient,
    recallPatient,
    skipCurrentPatient,
    setDoctorStatus,
  } = useHospital();

  const [counterDeptId, setCounterDeptId] = useState('ortho'); // Defaults to Room R101 Orthopaedics

  const currentQ = queues[counterDeptId] || { currentToken: 1, doctorStatus: 'available', tokens: [] };
  const dept = getDepartmentById(counterDeptId);
  const waitingTokens = currentQ.tokens.filter((t) => t.status === 'waiting');
  const nextToken = waitingTokens.length > 0 ? waitingTokens[0] : null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Top Urgent Alert Banner */}
      {urgentAlerts.length > 0 && (
        <div role="alert" className="bg-emergency-600 text-white p-5 rounded-2xl border-4 border-emergency-800 shadow-xl space-y-3 animate-pulse">
          <div className="flex items-center gap-2">
            <AlertIcon className="w-8 h-8 text-amber-300" />
            <h3 className="text-xl font-black uppercase">🚨 Urgent Patient Assistance Request</h3>
          </div>
          {urgentAlerts.map((a) => (
            <div key={a.id} className="bg-emergency-900/90 p-3 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold">{a.patientName} ({a.tokenCode}) - Location: {a.room}</p>
                <p className="text-xs text-amber-200">{a.notes}</p>
              </div>
              <button
                type="button"
                onClick={() => dismissUrgentAlert(a.id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
              >
                Mark Seen
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Counter Console Header */}
      <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-hospital-600 dark:text-hospital-400">
            Doctor Cabin Console
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {t(dept.nameKey)} (Room {dept.room})
          </h2>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {dept.doctorName} • {t(dept.floorKey)}
          </p>
        </div>

        {/* Counter Dept Switcher */}
        <select
          value={counterDeptId}
          onChange={(e) => setCounterDeptId(e.target.value)}
          className="min-h-[48px] px-3 font-bold rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-base focus:ring-4 focus:ring-hospital-400"
        >
          {DEPARTMENTS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.room} - {d.id.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Main Calling Display */}
      <div className="bg-hospital-50 dark:bg-hospital-950/80 border-4 border-hospital-600 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
        <p className="text-sm font-black uppercase tracking-widest text-hospital-700 dark:text-hospital-300">
          Current Calling Token In Room {dept.room}
        </p>
        <p className="text-6xl sm:text-7xl font-mono font-black text-hospital-900 dark:text-white tracking-tight">
          {dept.id.slice(0, 4).toUpperCase()}-{currentQ.currentToken}
        </p>
        <div className="flex items-center justify-center gap-2">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              currentQ.doctorStatus === 'available'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {currentQ.doctorStatus === 'available' ? '● Doctor Available' : '⏸ Doctor on Short Break'}
          </span>
        </div>
      </div>

      {/* Primary Calling Actions */}
      <div className="space-y-3">
        <button
          id="btn-counter-call-next"
          type="button"
          disabled={!nextToken}
          onClick={() => callNextPatient(counterDeptId)}
          className={`w-full min-h-[64px] py-4 px-6 rounded-2xl font-black text-2xl flex items-center justify-center gap-3 shadow-xl transition-all focus:ring-4 focus:ring-amber-300 focus:outline-none ${
            nextToken
              ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white active:scale-98'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          <ClockIcon className="w-8 h-8" />
          <span>
            {nextToken ? `Call Next Token (${nextToken.tokenCode})` : 'Queue Empty (No Patients Waiting)'}
          </span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => recallPatient(counterDeptId)}
            className="min-h-[56px] px-4 py-3 bg-hospital-700 hover:bg-hospital-800 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow focus:ring-4 focus:ring-amber-300 focus:outline-none"
          >
            <VolumeIcon className="w-6 h-6" />
            <span>Re-Call Token</span>
          </button>

          <button
            type="button"
            onClick={() => skipCurrentPatient(counterDeptId)}
            className="min-h-[56px] px-4 py-3 bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold text-lg rounded-xl focus:ring-4 focus:ring-slate-500 focus:outline-none"
          >
            <span>Skip / Absent</span>
          </button>
        </div>
      </div>

      {/* Doctor Status Toggle */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() =>
            setDoctorStatus(
              counterDeptId,
              currentQ.doctorStatus === 'available' ? 'break' : 'available'
            )
          }
          className="text-base font-bold text-hospital-700 dark:text-hospital-300 hover:underline"
        >
          {currentQ.doctorStatus === 'available' ? 'Take Short 10-Minute Break' : 'Resume Seeing Patients'}
        </button>
      </div>
    </div>
  );
}

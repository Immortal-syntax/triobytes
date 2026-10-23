import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext.jsx';
import { useHospital } from '../context/HospitalContext.jsx';
import { DEPARTMENTS, getDepartmentById } from '../data/departments.js';
import {
  StaffBadgeIcon,
  AlertIcon,
  ClockIcon,
  CheckCircleIcon,
  VolumeIcon,
  UserIcon,
} from '../components/common/Icons.jsx';

export default function StaffDashboardPage() {
  const { t } = useI18n();
  const {
    queues,
    urgentAlerts,
    dismissUrgentAlert,
    callNextPatient,
    recallPatient,
    skipCurrentPatient,
    setDoctorStatus,
    registerPatient,
  } = useHospital();

  const [selectedDeptId, setSelectedDeptId] = useState('ortho'); // Defaults to Orthopaedics for Kamla
  const [walkinName, setWalkinName] = useState('');
  const [walkinAge, setWalkinAge] = useState('');

  const currentQ = queues[selectedDeptId] || { currentToken: 1, doctorStatus: 'available', tokens: [] };
  const dept = getDepartmentById(selectedDeptId);

  // Filter waiting list
  const waitingTokens = currentQ.tokens.filter((t) => t.status === 'waiting');
  const currentServingToken = currentQ.tokens.find((t) => t.tokenNumber === currentQ.currentToken);

  const handleAddWalkin = (e) => {
    e.preventDefault();
    if (!walkinName.trim()) return;

    registerPatient({
      name: walkinName.trim(),
      age: walkinAge || '45',
      gender: 'female',
      deptId: selectedDeptId,
      avoidStairs: false,
    });

    setWalkinName('');
    setWalkinAge('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title */}
      <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <StaffBadgeIcon className="w-8 h-8 text-hospital-700 dark:text-hospital-400" />
            <span>{t('staff.title')}</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            {t('staff.subtitle')}
          </p>
        </div>
      </div>

      {/* SAFETY RULE 3: Urgent Patient Alerts Banner (Top Priority) */}
      {urgentAlerts.length > 0 ? (
        <div
          role="alert"
          aria-live="assertive"
          className="bg-emergency-600 text-white border-4 border-emergency-800 rounded-2xl p-5 shadow-2xl animate-pulse space-y-4"
        >
          <div className="flex items-center gap-3">
            <AlertIcon className="w-10 h-10 text-amber-300 flex-shrink-0 animate-bounce" />
            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-wide uppercase">
                🚨 {t('staff.urgentAlertHeader')}
              </h3>
              <p className="text-base text-amber-100 font-bold">
                Audible siren is active on this dashboard until cleared by medical staff.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {urgentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-emergency-900/90 border-2 border-amber-300 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="text-lg font-black text-amber-200">
                    Patient: {alert.patientName} (Token: {alert.tokenCode})
                  </p>
                  <p className="text-base text-white">
                    Reported at: <span className="font-bold">{alert.timestamp}</span> • Location: {alert.room}
                  </p>
                  <p className="text-sm text-amber-100 italic mt-0.5">{alert.notes}</p>
                </div>

                <button
                  type="button"
                  onClick={() => dismissUrgentAlert(alert.id)}
                  className="min-h-[56px] px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-lg rounded-xl shadow-lg border-2 border-white flex items-center gap-2 focus:ring-4 focus:ring-amber-300 focus:outline-none flex-shrink-0"
                >
                  <CheckCircleIcon className="w-6 h-6" />
                  <span>{t('staff.markSeen')}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 p-4 rounded-xl flex items-center gap-3 text-emerald-900 dark:text-emerald-200">
          <CheckCircleIcon className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <p className="font-bold text-base sm:text-lg">{t('staff.noUrgentAlerts')}</p>
        </div>
      )}

      {/* Select Department To Manage */}
      <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <label htmlFor="staff-dept-select" className="block font-bold text-lg text-slate-800 dark:text-slate-200">
          {t('staff.chooseDept')}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DEPARTMENTS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelectedDeptId(d.id)}
              className={`min-h-[56px] p-2.5 rounded-xl border-2 font-bold text-sm sm:text-base text-center transition-all focus:ring-4 focus:ring-hospital-400 focus:outline-none ${
                selectedDeptId === d.id
                  ? 'bg-hospital-600 text-white border-hospital-700 shadow-md ring-2 ring-hospital-400'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="block font-black">{t(d.shortKey)}</span>
              <span className="text-xs opacity-90">Room {d.room}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Clinic Control Center */}
      <div className="bg-white dark:bg-slate-800 border-3 border-hospital-500 rounded-2xl p-5 sm:p-6 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
          <div>
            <h3 className="text-2xl font-black text-hospital-900 dark:text-white">
              {t(dept.nameKey)} (Room {dept.room})
            </h3>
            <p className="text-base font-bold text-slate-600 dark:text-slate-300">
              {dept.doctorName} • {t(dept.doctorRoleKey)}
            </p>
          </div>

          {/* Toggle Doctor Break */}
          <button
            type="button"
            onClick={() =>
              setDoctorStatus(
                selectedDeptId,
                currentQ.doctorStatus === 'available' ? 'break' : 'available'
              )
            }
            className={`min-h-[56px] px-5 py-2.5 rounded-xl font-bold text-base border-2 focus:ring-4 focus:ring-hospital-400 focus:outline-none flex items-center gap-2 ${
              currentQ.doctorStatus === 'available'
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                : 'bg-emerald-600 text-white border-emerald-700'
            }`}
          >
            <span>
              {currentQ.doctorStatus === 'available' ? `⏸ ${t('staff.toggleBreak')}` : `▶ ${t('staff.toggleResume')}`}
            </span>
          </button>
        </div>

        {/* Current In-Cabin Token Card */}
        <div className="bg-hospital-50 dark:bg-hospital-950/80 border-2 border-hospital-300 dark:border-hospital-700 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="text-xs font-black text-hospital-700 dark:text-hospital-400 uppercase tracking-wider">
              {t('staff.currentlyServing')}
            </span>
            <p className="text-4xl sm:text-5xl font-black text-hospital-900 dark:text-white">
              {dept.id.slice(0, 4).toUpperCase()}-{currentQ.currentToken}
            </p>
            <p className="text-base font-bold text-slate-700 dark:text-slate-300 mt-1">
              {currentServingToken ? `${currentServingToken.patientName} (${currentServingToken.age} yrs)` : 'In Consultation'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Recall Button */}
            <button
              id="btn-staff-recall"
              type="button"
              onClick={() => recallPatient(selectedDeptId)}
              className="min-h-[56px] px-5 py-3 bg-hospital-700 hover:bg-hospital-800 text-white font-bold text-base rounded-xl flex items-center gap-2 shadow focus:ring-4 focus:ring-amber-300 focus:outline-none"
            >
              <VolumeIcon className="w-6 h-6" />
              <span>{t('staff.recall')}</span>
            </button>

            {/* Skip Button */}
            <button
              id="btn-staff-skip"
              type="button"
              onClick={() => skipCurrentPatient(selectedDeptId)}
              className="min-h-[56px] px-5 py-3 bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold text-base rounded-xl focus:ring-4 focus:ring-slate-500 focus:outline-none"
            >
              <span>{t('staff.skip')}</span>
            </button>
          </div>
        </div>

        {/* Primary Call Next Button */}
        <div>
          <button
            id="btn-staff-call-next"
            type="button"
            disabled={waitingTokens.length === 0}
            onClick={() => callNextPatient(selectedDeptId)}
            className={`w-full min-h-[56px] py-4 px-6 rounded-2xl font-black text-xl sm:text-2xl flex items-center justify-center gap-3 shadow-xl transition-all focus:ring-4 focus:ring-amber-300 focus:outline-none ${
              waitingTokens.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white active:scale-95'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <ClockIcon className="w-8 h-8" />
            <span>
              {waitingTokens.length > 0
                ? `${t('staff.callNext')} (Next: ${waitingTokens[0].tokenCode})`
                : t('staff.noWaiting')}
            </span>
          </button>
        </div>
      </div>

      {/* Waiting Tokens Queue Table */}
      <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t('staff.waitingList')}
          </h3>
          <span className="font-extrabold text-base px-3 py-1 bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-xl">
            {waitingTokens.length} Waiting
          </span>
        </div>

        {waitingTokens.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-base sm:text-lg">
              <thead className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                <tr>
                  <th className="p-3 font-bold rounded-l-xl">Token</th>
                  <th className="p-3 font-bold">Patient Name</th>
                  <th className="p-3 font-bold">Age</th>
                  <th className="p-3 font-bold">Stairs</th>
                  <th className="p-3 font-bold rounded-r-xl">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {waitingTokens.map((tk) => {
                  const isKamla = tk.isKamlaScenario || tk.patientName === 'Kamla';
                  return (
                    <tr
                      key={tk.tokenCode}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors ${
                        isKamla ? 'bg-amber-50 dark:bg-amber-950/60 font-bold' : ''
                      }`}
                    >
                      <td className="p-3 font-black text-hospital-700 dark:text-hospital-300">
                        {tk.tokenCode}
                        {isKamla && (
                          <span className="ml-2 text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-black">
                            KAMLA
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">
                        {tk.patientName}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">{tk.age} yrs</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        {tk.avoidStairs ? '♿ Avoids Stairs' : 'Normal'}
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 text-sm">{tk.timeIssued}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 italic py-4">{t('staff.noWaiting')}</p>
        )}
      </div>

      {/* Desk Form: Add Walk-in Token */}
      <div className="bg-slate-100 dark:bg-slate-800/60 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 space-y-3">
        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200">
          {t('staff.addWalkin')}
        </h4>
        <form onSubmit={handleAddWalkin} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Patient First Name"
            value={walkinName}
            onChange={(e) => setWalkinName(e.target.value)}
            className="flex-1 min-h-[56px] px-4 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base focus:ring-4 focus:ring-hospital-400 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Age"
            value={walkinAge}
            onChange={(e) => setWalkinAge(e.target.value)}
            className="w-28 min-h-[56px] px-4 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-base focus:ring-4 focus:ring-hospital-400 focus:outline-none"
          />
          <button
            type="submit"
            className="min-h-[56px] px-6 py-3 bg-hospital-600 hover:bg-hospital-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 focus:ring-4 focus:ring-hospital-400 focus:outline-none"
          >
            <span>+ Issue Token</span>
          </button>
        </form>
      </div>
    </div>
  );
}

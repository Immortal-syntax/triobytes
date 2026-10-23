import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n/useT.js';
import { useHospital } from '../context/HospitalContext.jsx';
import {
  TicketIcon,
  ClockIcon,
  UserIcon,
  InfoIcon,
} from '../components/common/Icons.jsx';

export default function HaveSlipPage() {
  const { t } = useT();
  const { loadKamlaDemo, setMyToken, queues } = useHospital();
  const navigate = useNavigate();

  const [inputToken, setInputToken] = useState('ORTHO-14');
  const [error, setError] = useState('');

  const handleLookup = (destinationRoute) => {
    const code = inputToken.trim().toUpperCase();
    if (!code) {
      setError('Please enter a valid token number (e.g. ORTHO-14)');
      return;
    }

    // Try finding in queues or generate matching token object
    let found = null;
    for (const q of Object.values(queues)) {
      const match = q.tokens.find((t) => t.tokenCode.toUpperCase() === code);
      if (match) {
        found = { ...match, deptId: q.deptId };
        break;
      }
    }

    if (found) {
      setMyToken(found);
    } else if (code === 'ORTHO-14') {
      found = loadKamlaDemo();
    }

    navigate(`/${destinationRoute}/${code}`);
  };

  const handleSelectSample = (sampleCode) => {
    setInputToken(sampleCode);
    if (sampleCode === 'ORTHO-14') {
      loadKamlaDemo();
    }
    navigate(`/turn/${sampleCode}`);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12">
      {/* Title */}
      <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-3">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <TicketIcon className="w-8 h-8 text-hospital-600 dark:text-hospital-400" />
          <span>{t('home.haveSlipTitle')}</span>
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-1">
          {t('home.haveSlipDesc')}
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <label htmlFor="input-token-code" className="block font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">
            Enter Token Number / टोकन नंबर दर्ज करें:
          </label>
          <input
            id="input-token-code"
            type="text"
            value={inputToken}
            onChange={(e) => {
              setInputToken(e.target.value);
              setError('');
            }}
            placeholder="e.g. ORTHO-14 or MED-21"
            className="w-full min-h-[56px] px-4 text-xl sm:text-2xl font-mono font-black uppercase rounded-xl border-3 border-hospital-500 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-4 focus:ring-hospital-400 focus:outline-none"
          />
          {error && (
            <p className="text-emergency-600 font-bold text-base mt-1" role="alert">
              ⚠️ {error}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            id="btn-lookup-turn"
            type="button"
            onClick={() => handleLookup('turn')}
            className="min-h-[56px] px-6 py-3 bg-hospital-600 hover:bg-hospital-700 active:bg-hospital-800 text-white font-black text-xl rounded-xl flex items-center justify-center gap-2 shadow-lg focus:ring-4 focus:ring-amber-300 focus:outline-none"
          >
            <ClockIcon className="w-6 h-6" />
            <span>Check My Turn</span>
          </button>

          <button
            id="btn-lookup-slip"
            type="button"
            onClick={() => handleLookup('slip')}
            className="min-h-[56px] px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow focus:ring-4 focus:ring-slate-500 focus:outline-none"
          >
            <TicketIcon className="w-6 h-6" />
            <span>View OPD Slip</span>
          </button>
        </div>
      </div>

      {/* Quick Sample Tokens */}
      <div className="bg-slate-100 dark:bg-slate-800/60 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 space-y-3">
        <p className="font-bold text-base text-slate-700 dark:text-slate-300">
          Or tap a sample patient token to test:
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => handleSelectSample('ORTHO-14')}
            className="min-h-[56px] p-3 rounded-xl bg-amber-100 dark:bg-amber-950 border-2 border-amber-400 text-amber-950 dark:text-amber-100 font-bold text-left flex items-center justify-between hover:bg-amber-200"
          >
            <div>
              <span className="font-black text-lg">Kamla (ORTHO-14)</span>
              <span className="text-sm block font-medium">Orthopaedics (Room R101, Floor 1) • Waiting: 3 ahead</span>
            </div>
            <span className="text-sm font-black bg-amber-300 dark:bg-amber-800 px-3 py-1 rounded-lg">Check</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSample('MED-21')}
            className="min-h-[56px] p-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 font-bold text-left flex items-center justify-between hover:bg-slate-50"
          >
            <div>
              <span className="font-black text-lg">Ram Prasad (MED-21)</span>
              <span className="text-sm block text-slate-600 dark:text-slate-400">Medicine (Room R1) • In Consultation</span>
            </div>
            <span className="text-sm font-bold bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-lg">Check</span>
          </button>
        </div>
      </div>
    </div>
  );
}

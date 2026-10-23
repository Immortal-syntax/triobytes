import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useT } from '../i18n/useT.js';
import { useHospital } from '../context/HospitalContext.jsx';
import { getDepartmentById } from '../data/departments.js';
import {
  ClockIcon,
  VolumeIcon,
  MapPinIcon,
  TicketIcon,
  CheckCircleIcon,
  AlertIcon,
  InfoIcon,
} from '../components/common/Icons.jsx';

export default function TurnTrackerPage() {
  const { token } = useParams();
  const { t, language } = useT();
  const { myToken, queues } = useHospital();
  const navigate = useNavigate();

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
    };
  }, [token, myToken, queues]);

  const dept = getDepartmentById(tokenData.deptId);
  const currentQ = queues[tokenData.deptId] || { currentToken: 1, doctorStatus: 'available', tokens: [] };

  const waitingTokens = currentQ.tokens.filter(
    (tk) => tk.status === 'waiting' && tk.tokenNumber < tokenData.tokenNumber
  );
  const peopleAhead = waitingTokens.length;

  const isMyTurnNow = currentQ.currentToken === tokenData.tokenNumber;
  const isMyTurnNext = peopleAhead === 0 && !isMyTurnNow;
  const estimatedWaitMinutes = peopleAhead * (dept.avgConsultTimeMinutes || 8);

  const handleAnnounce = () => {
    if (!('speechSynthesis' in window)) return;
    let msg = '';
    if (language === 'hi') {
      if (isMyTurnNow) {
        msg = `आपका टोकन नंबर ${tokenData.tokenCode} है। डॉक्टर आपको कमरा नंबर ${dept.room} में बुला रहे हैं। कृपया तुरंत अंदर जाएँ।`;
      } else if (isMyTurnNext) {
        msg = `आपका टोकन नंबर ${tokenData.tokenCode} है। अब अगली बारी आपकी है। कृपया कमरा नंबर ${dept.room} के बाहर तैयार रहें।`;
      } else {
        msg = `आपका टोकन नंबर ${tokenData.tokenCode} है। अभी कमरा नंबर ${dept.room} में टोकन नंबर ${currentQ.currentToken} देखा जा रहा है। आपसे पहले ${peopleAhead} मरीज़ बाकी हैं।`;
      }
    } else {
      if (isMyTurnNow) {
        msg = `Your token is ${tokenData.tokenCode}. The doctor is calling your token in Room ${dept.room} right now. Please step inside.`;
      } else if (isMyTurnNext) {
        msg = `Your token is ${tokenData.tokenCode}. Your turn is next! Please wait right outside Room ${dept.room}.`;
      } else {
        msg = `Your token is ${tokenData.tokenCode}. Currently in Room ${dept.room} is token ${currentQ.currentToken}. There are ${peopleAhead} patients ahead of you.`;
      }
    }

    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12">
      {/* Title & Speech */}
      <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ClockIcon className="w-8 h-8 text-hospital-600 dark:text-hospital-400" />
            <span>{t('queue.title')}</span>
          </h2>
          <p className="text-base sm:text-lg font-bold text-hospital-700 dark:text-hospital-300">
            {t(dept.nameKey)} • Room {dept.room} ({t(dept.floorKey)})
          </p>
        </div>

        <button
          type="button"
          onClick={handleAnnounce}
          className="min-h-[56px] px-4 py-2 bg-hospital-100 hover:bg-hospital-200 dark:bg-hospital-900 text-hospital-800 dark:text-hospital-200 font-bold rounded-xl border-2 border-hospital-400 flex items-center gap-2 focus:ring-4 focus:ring-hospital-400 focus:outline-none flex-shrink-0"
          aria-label={t('queue.announceBtn')}
        >
          <VolumeIcon className="w-6 h-6" />
          <span className="hidden sm:inline">{t('queue.announceBtn')}</span>
        </button>
      </div>

      {/* Main Status Alert Banner */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border-4 shadow-lg text-center space-y-2 transition-all ${
          isMyTurnNow
            ? 'bg-emerald-100 border-emerald-600 text-emerald-950 animate-bounce'
            : isMyTurnNext
            ? 'bg-amber-100 border-amber-600 text-amber-950'
            : 'bg-hospital-50 dark:bg-hospital-950/80 border-hospital-600 text-hospital-950 dark:text-white'
        }`}
      >
        <p className="text-xl sm:text-2xl font-black leading-snug">
          {isMyTurnNow
            ? `🟢 ${t('queue.statusInside')}`
            : isMyTurnNext
            ? `🟡 ${t('queue.statusReady')}`
            : `🔵 ${t('queue.statusWaiting')}`}
        </p>
        <p className="text-base sm:text-lg font-semibold opacity-90">
          Room {dept.room} • {dept.doctorName}
        </p>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 border-4 border-hospital-600 rounded-2xl p-5 text-center shadow-md">
          <p className="text-sm font-extrabold text-hospital-700 dark:text-hospital-300 uppercase tracking-wider">
            {t('queue.yourToken')}
          </p>
          <p className="text-4xl sm:text-5xl font-black text-hospital-900 dark:text-white my-1">
            {tokenData.tokenCode}
          </p>
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">
            {tokenData.patientName} ({tokenData.age} Yrs)
          </p>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800 border-4 border-slate-400 dark:border-slate-600 rounded-2xl p-5 text-center shadow-md">
          <p className="text-sm font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            {t('queue.nowServing')}
          </p>
          <p className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white my-1">
            {dept.id.slice(0, 4).toUpperCase()}-{currentQ.currentToken}
          </p>
          <p className="text-base font-bold text-slate-600 dark:text-slate-400">
            Inside Doctor's Room
          </p>
        </div>
      </div>

      {/* Queue Metrics */}
      <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <span className="font-bold text-lg text-slate-800 dark:text-slate-200">
            {t('queue.aheadCount')}:
          </span>
          <span className="text-3xl font-black text-amber-700 dark:text-amber-400 px-3 py-0.5 bg-amber-100 dark:bg-amber-950 rounded-xl">
            {peopleAhead}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-slate-800 dark:text-slate-200">
            {t('queue.estimatedWait')}:
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            ~{estimatedWaitMinutes} {t('queue.minutes')}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => navigate(`/find?dest=${dept.nodeId}`)}
          className="w-full min-h-[56px] py-3 px-6 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-black text-xl rounded-2xl flex items-center justify-center gap-3 shadow-lg focus:ring-4 focus:ring-amber-300 focus:outline-none"
        >
          <MapPinIcon className="w-7 h-7" />
          <span>Show Route to Room {dept.room}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate(`/slip/${tokenData.tokenCode}`)}
          className="w-full min-h-[56px] py-3 px-6 bg-slate-800 hover:bg-slate-900 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 focus:ring-4 focus:ring-slate-500 focus:outline-none"
        >
          <TicketIcon className="w-6 h-6" />
          <span>View OPD Slip</span>
        </button>
      </div>
    </div>
  );
}

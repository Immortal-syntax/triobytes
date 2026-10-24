import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useT } from '../i18n/useT.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { useHospital } from '../context/HospitalContext.jsx';
import { places } from '../data/hospital.js';
import { findRoute, buildDirections } from '../lib/routing.js';
import FloorSvgMap from '../components/map/FloorSvgMap.jsx';
import {
  EmergencyCrossIcon,
  PhoneIcon,
  MapPinIcon,
  AlertIcon,
  CheckCircleIcon,
  VolumeIcon,
  VolumeOffIcon,
  CloseIcon,
} from '../components/common/Icons.jsx';

// Ground floor places for the "where are you now?" picker
const GROUND_PLACES = Object.values(places)
  .filter((p) => p.floor === 0 && p.id !== 'g_casualty')
  .sort((a, b) => a.id.localeCompare(b.id));

const ALL_PLACES = Object.values(places)
  .filter((p) => p.id !== 'g_casualty')
  .sort((a, b) => a.floor - b.floor || a.id.localeCompare(b.id));

export default function EmergencyPage() {
  const { t } = useT();
  const { language } = useSettings();
  const { raiseFlag } = useHospital();

  // ── Where are you now? ──────────────────────────────────────────────────────
  const [fromId, setFromId] = useState('g_entrance');

  // ── Routing ─────────────────────────────────────────────────────────────────
  const route = useMemo(() => findRoute(fromId, 'g_casualty'), [fromId]);
  const directions = useMemo(() => buildDirections(route, t), [route, t]);

  // ── Web Speech (Listen button) ───────────────────────────────────────────────
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speaking on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const handleListen = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const textParts = [
      t('emergency.title'),
      t('emergency.subtext'),
      t('emergency.directionsHeading'),
      ...directions,
    ];
    const utterance = new SpeechSynthesisUtterance(textParts.join('. '));
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.85;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [isSpeaking, directions, t, language]);

  // ── Urgent Help Panel ────────────────────────────────────────────────────────
  const [urgentPanelOpen, setUrgentPanelOpen] = useState(false);
  const [isHelper, setIsHelper] = useState(false);
  const [alertSent, setAlertSent] = useState(false);

  const handleRaiseFlag = useCallback(() => {
    raiseFlag({
      from: fromId,
      reason: isHelper ? 'Helper-raised emergency request' : 'Patient self-raised emergency request',
      isHelper,
      createdAt: Date.now(),
    });
    setAlertSent(true);
  }, [raiseFlag, fromId, isHelper]);

  const resetUrgentPanel = useCallback(() => {
    setAlertSent(false);
    setIsHelper(false);
    setUrgentPanelOpen(false);
  }, []);

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-16">

      {/* ── 1. CALM MAIN BANNER ───────────────────────────────────────────── */}
      <div
        role="alert"
        aria-live="assertive"
        className="bg-emergency-600 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-emergency-800 space-y-3"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white text-emergency-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <EmergencyCrossIcon className="w-12 h-12 animate-pulse" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            {t('emergency.title')}
          </h2>
        </div>
        <p className="text-lg sm:text-xl font-semibold text-white/90 bg-emergency-800/60 px-4 py-3 rounded-xl border border-emergency-500">
          {t('emergency.subtext')}
        </p>
      </div>

      {/* ── 2. BIG PHONE CALL BUTTONS ────────────────────────────────────── */}
      <div className="space-y-3">
        <p className="font-bold text-base text-slate-600 dark:text-slate-300 uppercase tracking-widest">
          {t('emergency.helplineTitle')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            id="btn-call-112"
            href="tel:112"
            className="min-h-[72px] px-6 py-4 bg-emergency-600 hover:bg-emergency-700 active:bg-emergency-800 text-white font-black text-2xl rounded-2xl flex items-center justify-center gap-3 shadow-xl focus:ring-4 focus:ring-amber-300 focus:outline-none transition-transform active:scale-95"
            aria-label={t('emergency.call112')}
          >
            <PhoneIcon className="w-8 h-8 flex-shrink-0" />
            <span>{t('emergency.call112')}</span>
          </a>
          <a
            id="btn-call-108"
            href="tel:108"
            className="min-h-[72px] px-6 py-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-black text-2xl rounded-2xl flex items-center justify-center gap-3 shadow-xl focus:ring-4 focus:ring-amber-300 focus:outline-none transition-transform active:scale-95"
            aria-label={t('emergency.call108')}
          >
            <PhoneIcon className="w-8 h-8 flex-shrink-0" />
            <span>{t('emergency.call108')}</span>
          </a>
        </div>
      </div>

      {/* ── 3. I NEED URGENT HELP (alert staff) ──────────────────────────── */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 rounded-2xl p-5 sm:p-6 space-y-3">
        <h3 className="text-xl font-black text-amber-950 dark:text-amber-100 flex items-center gap-2">
          <AlertIcon className="w-7 h-7 text-emergency-600 flex-shrink-0" />
          {t('urgentHelp.button')}
        </h3>

        {!urgentPanelOpen ? (
          <button
            id="btn-emergency-raise-help"
            type="button"
            onClick={() => { setAlertSent(false); setIsHelper(false); setUrgentPanelOpen(true); }}
            className="w-full min-h-[64px] px-6 py-3 bg-emergency-700 hover:bg-emergency-800 active:bg-emergency-900 text-white font-black text-xl rounded-xl flex items-center justify-center gap-2 shadow-md focus:ring-4 focus:ring-amber-300 focus:outline-none transition-transform active:scale-95"
          >
            <AlertIcon className="w-6 h-6" />
            <span>{t('urgentHelp.button')}</span>
          </button>
        ) : alertSent ? (
          /* ── Confirmation view ── */
          <div className="space-y-4 text-center py-2" role="status" aria-live="polite">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircleIcon className="w-10 h-10" />
            </div>
            <p className="font-black text-xl text-emerald-900 dark:text-emerald-200">
              {t('urgentHelp.alertSentTitle')}
            </p>
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-300 p-4 rounded-xl text-emerald-950 dark:text-emerald-100 text-left">
              <p className="font-bold text-lg">{t('urgentHelp.alertSentBody')}</p>
              <p className="text-sm mt-2 text-emerald-700 dark:text-emerald-300">
                🔔 {t('urgentHelp.soundNotice')}
              </p>
            </div>
            <button
              type="button"
              onClick={resetUrgentPanel}
              className="w-full min-h-[56px] px-6 py-3 bg-slate-800 dark:bg-slate-700 text-white font-bold text-lg rounded-xl flex items-center justify-center focus:ring-4 focus:ring-slate-500 focus:outline-none"
            >
              {t('emergency.close')}
            </button>
          </div>
        ) : (
          /* ── Pre-confirm view ── */
          <div className="space-y-4">
            {/* Helper toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                id="chk-is-helper"
                type="checkbox"
                checked={isHelper}
                onChange={(e) => setIsHelper(e.target.checked)}
                className="w-5 h-5 rounded accent-emergency-600"
              />
              <span className="font-semibold text-base text-amber-950 dark:text-amber-100">
                {t('urgentHelp.helperToggle')}
              </span>
            </label>

            <p className="text-base text-amber-900 dark:text-amber-200 font-medium">
              {t('urgentHelp.modalBody')}
            </p>

            <div className="flex flex-col gap-3 pt-1">
              <button
                id="btn-confirm-alert-staff"
                type="button"
                onClick={handleRaiseFlag}
                className="w-full min-h-[64px] px-6 py-3 bg-emergency-600 hover:bg-emergency-700 active:bg-emergency-800 text-white font-extrabold text-xl rounded-xl flex items-center justify-center gap-3 shadow-lg focus:ring-4 focus:ring-amber-300 focus:outline-none transition-transform active:scale-95"
              >
                <AlertIcon className="w-7 h-7" />
                <span>{t('urgentHelp.confirmBtn')}</span>
              </button>
              <button
                type="button"
                onClick={resetUrgentPanel}
                className="w-full min-h-[56px] px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-100 font-bold text-lg rounded-xl flex items-center justify-center focus:ring-4 focus:ring-slate-500 focus:outline-none"
              >
                {t('urgentHelp.cancelBtn')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 4. WHERE ARE YOU NOW? (location picker) + FLOOR MAP + DIRECTIONS ── */}
      <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        {/* Heading */}
        <div className="flex items-start gap-3">
          <MapPinIcon className="w-8 h-8 text-emergency-600 flex-shrink-0 mt-0.5" />
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t('emergency.routeHeading')}
          </h3>
        </div>

        {/* Location picker */}
        <div>
          <label
            htmlFor="sel-from-location"
            className="block text-base font-bold text-slate-700 dark:text-slate-200 mb-2"
          >
            {t('emergency.whereAreYou')}
          </label>
          <select
            id="sel-from-location"
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            className="w-full min-h-[52px] px-4 py-2 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-base font-semibold text-slate-900 dark:text-white focus:ring-4 focus:ring-hospital-400 focus:outline-none"
          >
            {ALL_PLACES.map((p) => (
              <option key={p.id} value={p.id}>
                {t(p.nameKey) || p.id}
              </option>
            ))}
          </select>
        </div>

        {/* Floor SVG Map */}
        <FloorSvgMap
          floor={0}
          activeNodeId="g_casualty"
          activePath={route.found ? route.steps : []}
          onSelectNode={() => {}}
        />

        {/* Distance info */}
        {route.found && route.totalMetres > 0 && (
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 text-center">
            {t('emergency.totalDistance')}: ~{route.totalMetres} {t('emergency.meters')}
          </p>
        )}

        {/* Listen button */}
        <button
          id="btn-listen-emergency"
          type="button"
          onClick={handleListen}
          className={`w-full min-h-[56px] px-6 py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 border-2 focus:ring-4 focus:ring-hospital-400 focus:outline-none transition-colors ${
            isSpeaking
              ? 'bg-amber-400 text-black border-amber-500 animate-pulse'
              : 'bg-slate-800 dark:bg-slate-700 text-white border-slate-600 hover:bg-slate-700'
          }`}
          aria-live="polite"
          aria-label={isSpeaking ? t('emergency.stopListenBtn') : t('emergency.listenBtn')}
        >
          {isSpeaking ? (
            <>
              <VolumeOffIcon className="w-6 h-6 flex-shrink-0" />
              <span>{t('emergency.stopListenBtn')}</span>
            </>
          ) : (
            <>
              <VolumeIcon className="w-6 h-6 flex-shrink-0" />
              <span>{t('emergency.listenBtn')}</span>
            </>
          )}
        </button>

        {/* Step-by-step directions */}
        {directions.length > 0 && (
          <div className="space-y-2">
            <p className="font-black text-base text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              {t('emergency.directionsHeading')}
            </p>
            <ol className="space-y-2 list-none">
              {directions.map((step, i) => (
                <li
                  key={i}
                  className="flex gap-3 items-start bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-base font-medium text-slate-800 dark:text-slate-100"
                >
                  <span className="w-7 h-7 rounded-full bg-hospital-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Open full map link */}
        <Link
          to="/find?dest=g_casualty"
          className="w-full min-h-[52px] px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold text-base rounded-xl flex items-center justify-center gap-2 focus:ring-4 focus:ring-hospital-400 focus:outline-none border border-slate-300 dark:border-slate-600"
        >
          <MapPinIcon className="w-5 h-5" />
          <span>{t('emergency.viewMap')}</span>
        </Link>
      </div>
    </div>
  );
}

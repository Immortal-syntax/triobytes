/**
 * FindPlacePage  –  /find
 *
 * Features
 * ────────
 * • Search box that filters all places by name/keyword
 * • Grouped place list (by floor) with icons
 * • "I am at" (from) picker – default: Main Entrance
 * • "Avoid stairs" toggle (persisted in SettingsContext)
 * • Inline SVG floor plan per floor, drawn from hospital.js x/y data
 *   – Background rooms, corridors, floor boundary
 *   – Route polyline highlighted in the route colour
 *   – Numbered step circles on route nodes (matching direction list)
 *   – Start (🟢) and End (🔴) markers with text labels
 *   – Floor tabs auto-jump to active floor; user can switch
 * • Numbered step-by-step directions with landmark hints
 *   – "Listen to all" reads every step aloud
 *   – Tapping a single step reads only that step
 * • "I'm Lost" button → route to nearest Help Desk
 *   – Plus a large staff-card showing destination in patient's language + English
 * • Responds to ?dest= query param (from /turn/:token links)
 */

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { useT } from '../i18n/useT.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { places, edges, floors } from '../data/hospital.js';
import { findRoute, buildDirections } from '../lib/routing.js';

// ─── SVG canvas size ──────────────────────────────────────────────────────────
const SVG_W = 360;
const SVG_H = 240;
// Padding around data points
const PAD = 18;

// ─── Place type → icon mapping (emoji, no external dep) ──────────────────────
const TYPE_ICON = {
  entrance:  '🚪',
  desk:      '🪑',
  emergency: '🚨',
  pharmacy:  '💊',
  water:     '💧',
  lift:      '🛗',
  stairs:    '🪜',
  toilet:    '🚻',
  room:      '🏥',
  hall:      '⏳',
  ramp:      '♿',
  facility:  '♿',
  junction:  '🔀',
};

// ─── Type colour classes for list cards ──────────────────────────────────────
const TYPE_BG = {
  emergency: 'bg-red-100 dark:bg-red-950 border-red-400',
  room:      'bg-hospital-50 dark:bg-hospital-950 border-hospital-400',
  desk:      'bg-blue-50 dark:bg-blue-950 border-blue-400',
  lift:      'bg-sky-50 dark:bg-sky-950 border-sky-400',
  ramp:      'bg-amber-50 dark:bg-amber-950 border-amber-400',
  facility:  'bg-amber-50 dark:bg-amber-950 border-amber-400',
  toilet:    'bg-slate-50 dark:bg-slate-800 border-slate-300',
  water:     'bg-cyan-50 dark:bg-cyan-950 border-cyan-400',
  pharmacy:  'bg-emerald-50 dark:bg-emerald-950 border-emerald-400',
  hall:      'bg-purple-50 dark:bg-purple-950 border-purple-400',
  default:   'bg-white dark:bg-slate-800 border-slate-300',
};

// ─── Canonical place list (excluding stairs — they're navigation-only) ────────
const ALL_PLACES = Object.values(places).filter(
  (p) => p.type !== 'stairs' && p.type !== 'junction'
);

// ─── Floor background shapes ─────────────────────────────────────────────────
// Simple rectangles representing functional zones on each floor
const FLOOR_ZONES = {
  0: [
    { x: 30,  y: 30,  w: 300, h: 185, label: 'Hospital', fill: '#f1f5f9', stroke: '#94a3b8' },
    { x: 30,  y: 145, w: 70,  h: 70,  label: 'CASUALTY', fill: '#fee2e2', stroke: '#f87171' },
    { x: 200, y: 145, w: 130, h: 70,  label: 'REGISTRATION', fill: '#dbeafe', stroke: '#60a5fa' },
    { x: 100, y: 200, w: 160, h: 40,  label: 'MAIN ENTRANCE', fill: '#d1fae5', stroke: '#34d399' },
  ],
  1: [
    { x: 30,  y: 30,  w: 300, h: 185, label: 'Floor 1', fill: '#f1f5f9', stroke: '#94a3b8' },
    { x: 30,  y: 30,  w: 300, h: 50,  label: 'NORTH CORRIDOR — Rooms 1-5', fill: '#ede9fe', stroke: '#a78bfa' },
    { x: 30,  y: 160, w: 300, h: 55,  label: 'SOUTH CORRIDOR — Rooms 6-8', fill: '#fce7f3', stroke: '#f472b6' },
    { x: 100, y: 80,  w: 160, h: 80,  label: 'WAITING HALL A', fill: '#ecfdf5', stroke: '#6ee7b7' },
  ],
  2: [
    { x: 30,  y: 30,  w: 300, h: 185, label: 'Floor 2', fill: '#f1f5f9', stroke: '#94a3b8' },
    { x: 30,  y: 30,  w: 115, h: 80,  label: 'WARD 4', fill: '#fef3c7', stroke: '#fbbf24' },
    { x: 215, y: 30,  w: 115, h: 80,  label: 'WARD 5', fill: '#fef3c7', stroke: '#fbbf24' },
    { x: 110, y: 155, w: 140, h: 60,  label: 'WARD 6', fill: '#dbeafe', stroke: '#60a5fa' },
    { x: 100, y: 90,  w: 160, h: 65,  label: "NURSES' STATION", fill: '#ecfdf5', stroke: '#6ee7b7' },
  ],
};

// ─── Scale data coords from the 360×240 plan to SVG canvas ───────────────────
function scaleX(x) { return PAD + (x / SVG_W) * (SVG_W - PAD * 2); }
function scaleY(y) { return PAD + (y / SVG_H) * (SVG_H - PAD * 2); }

// ─── Inline floor plan SVG ────────────────────────────────────────────────────
function FloorPlan({ floorLevel, routeSteps, startId, endId, t }) {
  const floorPlaces = Object.values(places).filter((p) => p.floor === floorLevel);
  const zones = FLOOR_ZONES[floorLevel] || [];

  // Route nodes on this floor
  const routeOnFloor = routeSteps.filter(
    (id) => places[id] && places[id].floor === floorLevel
  );

  // Edges on this floor (both endpoints on same floor)
  const edgesOnFloor = edges.filter((e) => {
    const a = places[e.from];
    const b = places[e.to];
    return a && b && a.floor === floorLevel && b.floor === floorLevel;
  });

  // Route polyline points
  const routePolyline = routeOnFloor
    .map((id) => `${scaleX(places[id].x)},${scaleY(places[id].y)}`)
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
      aria-label={`Floor ${floorLevel} plan`}
    >
      {/* Zone backgrounds */}
      {zones.map((z, i) => (
        <g key={i}>
          <rect
            x={z.x} y={z.y} width={z.w} height={z.h}
            rx="4" fill={z.fill} stroke={z.stroke} strokeWidth="1.5"
          />
        </g>
      ))}

      {/* All corridor edges (faint) */}
      {edgesOnFloor.map((e, i) => {
        const a = places[e.from];
        const b = places[e.to];
        if (!a || !b) return null;
        return (
          <line
            key={i}
            x1={scaleX(a.x)} y1={scaleY(a.y)}
            x2={scaleX(b.x)} y2={scaleY(b.y)}
            stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 3"
          />
        );
      })}

      {/* Route highlight polyline */}
      {routeOnFloor.length > 1 && (
        <polyline
          points={routePolyline}
          fill="none"
          stroke="#2563eb"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />
      )}

      {/* Place nodes */}
      {floorPlaces.map((p) => {
        const cx = scaleX(p.x);
        const cy = scaleY(p.y);
        const isStart = p.id === startId;
        const isEnd   = p.id === endId;
        const isRoute = routeOnFloor.includes(p.id);
        const icon    = TYPE_ICON[p.type] || '•';

        return (
          <g key={p.id}>
            <circle
              cx={cx} cy={cy}
              r={isStart || isEnd ? 10 : isRoute ? 7 : 5}
              fill={isStart ? '#16a34a' : isEnd ? '#dc2626' : isRoute ? '#2563eb' : '#94a3b8'}
              stroke="white" strokeWidth="1.5"
            />
            {(isStart || isEnd) && (
              <>
                <text
                  x={cx} y={cy - 13}
                  fontSize="9" fontWeight="bold" textAnchor="middle"
                  fill={isStart ? '#15803d' : '#b91c1c'}
                >
                  {isStart ? '▶ START' : '★ DEST'}
                </text>
                {/* Destination label */}
                <rect
                  x={cx - 35} y={cy + 12}
                  width="70" height="14" rx="3"
                  fill={isStart ? '#dcfce7' : '#fee2e2'}
                  stroke={isStart ? '#16a34a' : '#dc2626'}
                  strokeWidth="1"
                />
                <text
                  x={cx} y={cy + 22}
                  fontSize="7" fontWeight="bold" textAnchor="middle"
                  fill={isStart ? '#15803d' : '#b91c1c'}
                >
                  {t(p.nameKey).slice(0, 18)}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* Step numbers on route nodes */}
      {routeOnFloor.map((id, idx) => {
        const p = places[id];
        if (!p || id === startId || id === endId) return null;
        return (
          <text
            key={id}
            x={scaleX(p.x)}
            y={scaleY(p.y) + 4}
            fontSize="7" fontWeight="bold" textAnchor="middle"
            fill="white"
          >
            {idx + 1}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function FindPlacePage() {
  const { t, language } = useT();
  const { avoidStairs, setAvoidStairs } = useSettings();
  const [searchParams] = useSearchParams();

  // ── State ──
  const [query, setQuery]         = useState('');
  const [fromId, setFromId]       = useState('g_entrance');
  const [destId, setDestId]       = useState(() => {
    const p = searchParams.get('dest');
    return p && places[p] ? p : 'f1_room_3';
  });
  const [activeFloor, setActiveFloor] = useState(1);
  const [readingIdx, setReadingIdx]   = useState(null); // index of step being spoken
  const [showLostCard, setShowLostCard] = useState(false);
  const speechRef = useRef(null);

  // ── Respond to ?dest= param changes ──
  useEffect(() => {
    const p = searchParams.get('dest');
    if (p && places[p]) {
      setDestId(p);
      setActiveFloor(places[p].floor);
    }
  }, [searchParams]);

  // ── Auto-jump to destination floor when dest changes ──
  useEffect(() => {
    if (places[destId]) setActiveFloor(places[destId].floor);
  }, [destId]);

  // ── Route ──
  const route = useMemo(
    () => findRoute(fromId, destId, { avoidStairs }),
    [fromId, destId, avoidStairs]
  );

  const directions = useMemo(
    () => (route.found ? buildDirections(route, t) : []),
    [route, t]
  );

  const totalMetres = route.totalMetres || 0;

  // ── "I'm Lost" → nearest help desk ──
  const lostRoute = useMemo(
    () => findRoute(fromId, 'g_help_desk', { avoidStairs }),
    [fromId, avoidStairs]
  );
  const lostDirections = useMemo(
    () => (lostRoute.found ? buildDirections(lostRoute, t) : []),
    [lostRoute, t]
  );

  // ── Filtered place list ──
  const filteredPlaces = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_PLACES;
    return ALL_PLACES.filter((p) => {
      const name = t(p.nameKey).toLowerCase();
      const landmark = t(p.landmarkKey).toLowerCase();
      return name.includes(q) || landmark.includes(q) || p.type.includes(q);
    });
  }, [query, t]);

  // grouped by floor
  const grouped = useMemo(() => {
    const g = { 0: [], 1: [], 2: [] };
    filteredPlaces.forEach((p) => {
      if (g[p.floor] !== undefined) g[p.floor].push(p);
    });
    return g;
  }, [filteredPlaces]);

  // ── Speech helper ──
  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utt.rate = 0.85;
    utt.onend = () => setReadingIdx(null);
    utt.onerror = () => setReadingIdx(null);
    speechRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, [language]);

  const handleListenAll = useCallback(() => {
    if (readingIdx !== null) {
      window.speechSynthesis.cancel();
      setReadingIdx(null);
      return;
    }
    const full = directions
      .map((s, i) => `${t('map.step')} ${i + 1}: ${s}`)
      .join('. ');
    setReadingIdx(-1); // -1 = all
    speak(full);
  }, [directions, readingIdx, speak, t]);

  const handleListenStep = useCallback((text, idx) => {
    if (readingIdx === idx) {
      window.speechSynthesis.cancel();
      setReadingIdx(null);
      return;
    }
    setReadingIdx(idx);
    speak(`${t('map.step')} ${idx + 1}: ${text}`);
  }, [readingIdx, speak, t]);

  // Stop speech on unmount
  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  // ── Dest info ──
  const destPlace = places[destId];
  const destName  = destPlace ? t(destPlace.nameKey) : '';

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-12">

      {/* ── Title ── */}
      <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-3">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          🗺️ {t('map.title')}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 mt-1">
          {t('home.findPlaceDesc')}
        </p>
      </div>

      {/* ── Search box ── */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">🔍</span>
        <input
          id="find-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a room, clinic, lift, washroom…"
          className="w-full min-h-[56px] pl-12 pr-4 text-lg font-semibold rounded-2xl border-2 border-hospital-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-4 focus:ring-hospital-400 focus:outline-none shadow-sm"
        />
      </div>

      {/* ── Filtered place list (shown when query is non-empty) ── */}
      {query.trim() && (
        <div className="space-y-3">
          {[0, 1, 2].map((fl) => {
            const items = grouped[fl];
            if (!items.length) return null;
            const floorName = t(floors[fl]?.shortKey || `hospital.floor_${fl}_short`);
            return (
              <section key={fl}>
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                  {floorName}
                </h2>
                <div className="space-y-1.5">
                  {items.map((p) => {
                    const bg = TYPE_BG[p.type] || TYPE_BG.default;
                    const icon = TYPE_ICON[p.type] || '🏥';
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { setDestId(p.id); setQuery(''); }}
                        className={`w-full p-3 rounded-xl border-2 ${bg} text-left flex items-center gap-3 hover:opacity-80 active:scale-[0.98] transition-transform focus:ring-4 focus:ring-hospital-400 focus:outline-none`}
                      >
                        <span className="text-2xl flex-shrink-0">{icon}</span>
                        <div className="min-w-0">
                          <p className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                            {t(p.nameKey)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {floorName} • {t(p.landmarkKey)}
                          </p>
                        </div>
                        <span className="ml-auto text-hospital-600 dark:text-hospital-400 font-black text-sm flex-shrink-0">
                          Select →
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
          {filteredPlaces.length === 0 && (
            <p className="text-center text-slate-400 py-6">No places found for "{query}"</p>
          )}
        </div>
      )}

      {/* ── From / To / Avoid Stairs controls ── */}
      <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* From */}
          <div>
            <label htmlFor="find-from" className="block text-sm font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              {t('map.startLocation')}
            </label>
            <select
              id="find-from"
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="w-full min-h-[52px] px-3 text-base font-bold rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-4 focus:ring-hospital-400 focus:outline-none"
            >
              <optgroup label="Ground Floor">
                <option value="g_entrance">🚪 Main Entrance (Gate 1)</option>
                <option value="g_lobby">🔀 Ground Floor Lobby</option>
                <option value="g_reg_counters">🪑 Registration Desk</option>
                <option value="g_casualty">🚨 Casualty / Emergency</option>
                <option value="g_lift">🛗 Ground Floor Lift</option>
              </optgroup>
              <optgroup label="First Floor">
                <option value="f1_lift">🛗 First Floor Lift</option>
                <option value="f1_waiting_a">⏳ First Floor Waiting Hall</option>
              </optgroup>
              <optgroup label="Second Floor">
                <option value="f2_lift">🛗 Second Floor Lift</option>
                <option value="f2_nurse_station">🪑 Nurses' Station</option>
              </optgroup>
            </select>
          </div>

          {/* To */}
          <div>
            <label htmlFor="find-dest" className="block text-sm font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              {t('map.destination')}
            </label>
            <select
              id="find-dest"
              value={destId}
              onChange={(e) => setDestId(e.target.value)}
              className="w-full min-h-[52px] px-3 text-base font-bold rounded-xl border-2 border-hospital-500 bg-hospital-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-4 focus:ring-hospital-400 focus:outline-none"
            >
              <optgroup label="Ground Floor">
                <option value="g_casualty">🚨 Casualty / Emergency (E1)</option>
                <option value="g_reg_counters">🪑 Registration Counters</option>
                <option value="g_pharmacy">💊 Pharmacy</option>
                <option value="g_water">💧 Drinking Water (Ground)</option>
                <option value="g_toilets">🚻 Washrooms (Ground)</option>
                <option value="g_lab">🧪 Lab / Blood Tests</option>
                <option value="g_xray">☢️ X-Ray Room</option>
                <option value="g_help_desk">🪑 Help Desk</option>
              </optgroup>
              <optgroup label="First Floor — OPD Rooms">
                <option value="f1_room_1">🏥 Room 1 – General Medicine</option>
                <option value="f1_room_2">🏥 Room 2 – General Medicine</option>
                <option value="f1_room_3">🏥 Room 3 – Children</option>
                <option value="f1_room_4">🏥 Room 4 – Women & Pregnancy</option>
                <option value="f1_room_5">🏥 Room 5 – Bones & Joints</option>
                <option value="f1_room_6">🏥 Room 6 – ENT</option>
                <option value="f1_room_7">🏥 Room 7 – Eyes</option>
                <option value="f1_room_8">🏥 Room 8 – Skin</option>
                <option value="f1_toilets">🚻 Washrooms (Floor 1)</option>
                <option value="f1_waiting_a">⏳ Waiting Hall A</option>
              </optgroup>
              <optgroup label="Second Floor — Wards">
                <option value="f2_ward_4">🛏️ Ward 4 – Medicine</option>
                <option value="f2_ward_5">🛏️ Ward 5 – Surgery</option>
                <option value="f2_ward_6">🛏️ Ward 6 – Children</option>
                <option value="f2_nurse_station">🪑 Nurses' Station</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Avoid stairs toggle */}
        <button
          type="button"
          id="find-avoid-stairs"
          onClick={() => setAvoidStairs(!avoidStairs)}
          aria-pressed={avoidStairs}
          className={`w-full min-h-[52px] px-4 py-3 rounded-xl font-black text-base border-2 flex items-center gap-3 focus:ring-4 focus:ring-hospital-400 focus:outline-none transition-colors ${
            avoidStairs
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-400'
          }`}
        >
          <span className="text-2xl">{avoidStairs ? '♿' : '🪜'}</span>
          <span>
            {avoidStairs ? t('map.avoidStairsOn') : t('map.avoidStairsOff')}
          </span>
          <span className="ml-auto text-sm font-bold opacity-80">
            {avoidStairs ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* ── Route summary ── */}
      {route.found && (
        <div className="flex items-center justify-between bg-hospital-50 dark:bg-hospital-950/60 border-2 border-hospital-400 rounded-2xl px-5 py-3 shadow-sm">
          <div>
            <p className="text-sm font-extrabold uppercase text-hospital-600 dark:text-hospital-400 tracking-wider">
              Route found
            </p>
            <p className="text-lg font-black text-hospital-900 dark:text-white">
              ~{totalMetres} m · {directions.length} steps
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              id="find-listen-all"
              onClick={handleListenAll}
              className="min-h-[48px] px-4 py-2 bg-hospital-600 hover:bg-hospital-700 text-white font-bold rounded-xl flex items-center gap-2 focus:ring-4 focus:ring-hospital-400 focus:outline-none"
            >
              {readingIdx !== null ? '⏹ Stop' : '🔊 Listen'}
            </button>
            <button
              type="button"
              id="find-im-lost"
              onClick={() => setShowLostCard((v) => !v)}
              className="min-h-[48px] px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center gap-2 focus:ring-4 focus:ring-amber-400 focus:outline-none"
            >
              🆘 Lost?
            </button>
          </div>
        </div>
      )}

      {!route.found && (
        <div className="bg-red-50 dark:bg-red-950 border-2 border-red-400 rounded-2xl px-5 py-4 text-red-800 dark:text-red-300 font-bold text-center">
          ⚠️ No route found. Try turning off "Avoid Stairs".
        </div>
      )}

      {/* ── I'm Lost panel ── */}
      {showLostCard && (
        <div className="bg-amber-50 dark:bg-amber-950 border-2 border-amber-500 rounded-2xl p-5 space-y-4 shadow-lg">
          <h2 className="text-xl font-black text-amber-900 dark:text-amber-200">
            🆘 Route to Help Desk
          </h2>
          <p className="text-base text-amber-800 dark:text-amber-300">
            Show this to any staff member:
          </p>

          {/* Staff card */}
          <div className="bg-white dark:bg-slate-900 border-4 border-amber-600 rounded-2xl p-5 text-center shadow-xl">
            <p className="text-sm font-extrabold uppercase text-amber-600 mb-2">
              Patient needs to reach:
            </p>
            <p className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
              {destName}
            </p>
            {language === 'hi' && (
              <p className="text-xl font-bold text-slate-600 dark:text-slate-400 mt-2">
                {destName} {/* Hindi fallback — same key, renders in Hindi if translated */}
              </p>
            )}
            <p className="mt-3 text-base text-slate-500 font-semibold">
              English: {places[destId] ? t(places[destId].nameKey) : ''}
            </p>
          </div>

          {/* Lost directions */}
          {lostDirections.length > 0 && (
            <ol className="space-y-2">
              {lostDirections.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-amber-900 dark:text-amber-200">
                  <span className="w-6 h-6 bg-amber-500 text-white text-xs font-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-semibold leading-snug">{step}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* ── Floor plan tabs & SVG maps ── */}
      <section>
        <div className="flex gap-2 mb-3">
          {floors.map((fl) => (
            <button
              key={fl.level}
              type="button"
              onClick={() => setActiveFloor(fl.level)}
              className={`flex-1 min-h-[44px] px-2 py-1.5 rounded-xl font-black text-sm border-2 transition-all focus:ring-4 focus:ring-hospital-400 focus:outline-none ${
                activeFloor === fl.level
                  ? 'bg-hospital-600 text-white border-hospital-700 shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {t(fl.shortKey)}
              {route.found && route.steps.some((id) => places[id]?.floor === fl.level) && (
                <span className="ml-1 text-xs bg-blue-500 text-white rounded-full px-1.5 py-0.5">
                  Route
                </span>
              )}
            </button>
          ))}
        </div>

        <FloorPlan
          key={activeFloor}
          floorLevel={activeFloor}
          routeSteps={route.found ? route.steps : []}
          startId={fromId}
          endId={destId}
          t={t}
        />
      </section>

      {/* ── Step-by-step directions ── */}
      {directions.length > 0 && (
        <section className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {t('map.routeTitle')}
            </h2>
            <span className="text-sm font-bold text-hospital-700 dark:text-hospital-400">
              {totalMetres} {t('map.meters')} total
            </span>
          </div>

          <ol className="space-y-2">
            {directions.map((step, idx) => {
              const isLast = idx === directions.length - 1;
              const isSpeaking = readingIdx === idx;
              return (
                <li
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                    isLast
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400'
                      : isSpeaking
                      ? 'bg-hospital-100 dark:bg-hospital-900 border-hospital-400'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => handleListenStep(step, idx)}
                  role="button"
                  aria-label={`Step ${idx + 1}: ${step}. Tap to listen.`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 mt-0.5 ${
                    isLast ? 'bg-emerald-600 text-white' : 'bg-hospital-600 text-white'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-base leading-snug ${isLast ? 'font-bold text-emerald-800 dark:text-emerald-300' : 'font-semibold text-slate-800 dark:text-slate-200'}`}>
                      {step}
                    </p>
                  </div>
                  <span className="text-lg flex-shrink-0 opacity-50" title="Tap to listen">
                    {isSpeaking ? '⏹' : '🔊'}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}

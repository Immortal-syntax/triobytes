import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useT } from '../i18n/useT.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { FLOORS, MAP_NODES, MAP_EDGES, findPath } from '../data/hospital.js';
import FloorSvgMap from '../components/map/FloorSvgMap.jsx';
import {
  SearchIcon,
  MapPinIcon,
  VolumeIcon,
  CheckCircleIcon,
  StairsIcon,
  RampIcon,
  ElevatorIcon,
  InfoIcon,
} from '../components/common/Icons.jsx';

export default function FindPlacePage() {
  const { t, language } = useT();
  const { avoidStairs, setAvoidStairs } = useSettings();
  const [searchParams] = useSearchParams();

  const [currentFloor, setCurrentFloor] = useState(0);
  const [startNodeId, setStartNodeId] = useState('gate_1');
  const [destNodeId, setDestNodeId] = useState(() => {
    const p = searchParams.get('dest');
    return p && MAP_NODES[p] ? p : 'ortho_101';
  });

  useEffect(() => {
    const p = searchParams.get('dest');
    if (p && MAP_NODES[p]) {
      setDestNodeId(p);
      setCurrentFloor(MAP_NODES[p].floor);
    }
  }, [searchParams]);

  useEffect(() => {
    if (MAP_NODES[destNodeId]) {
      setCurrentFloor(MAP_NODES[destNodeId].floor);
    }
  }, [destNodeId]);

  // Dijkstra Path
  const path = useMemo(() => {
    return findPath(startNodeId, destNodeId, avoidStairs);
  }, [startNodeId, destNodeId, avoidStairs]);

  // Total Distance
  const totalMeters = useMemo(() => {
    let dist = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i];
      const v = path[i + 1];
      const edge = MAP_EDGES.find(
        (e) => (e.from === u && e.to === v) || (e.from === v && e.to === u)
      );
      if (edge) dist += edge.distance;
    }
    return dist;
  }, [path]);

  // Step Directions
  const steps = useMemo(() => {
    if (path.length <= 1) return [];

    const generated = [];
    const startNode = MAP_NODES[path[0]];
    generated.push({
      id: 'step-0',
      text: t('dir.startAt', { from: t(startNode.nameKey) }),
    });

    for (let i = 1; i < path.length; i++) {
      const prev = MAP_NODES[path[i - 1]];
      const curr = MAP_NODES[path[i]];
      const edge = MAP_EDGES.find(
        (e) => (e.from === prev.id && e.to === curr.id) || (e.from === curr.id && e.to === prev.id)
      );

      const targetFloorName =
        curr.floor === 0
          ? t('floors.ground.name')
          : curr.floor === 1
          ? t('floors.first.name')
          : t('floors.second.name');

      if (edge?.isElevator && curr.floor !== prev.floor) {
        generated.push({
          id: `step-${i}`,
          text: t('dir.takeLift', { floor: targetFloorName }),
          isTransition: true,
        });
      } else if (edge?.isRamp && curr.floor !== prev.floor) {
        generated.push({
          id: `step-${i}`,
          text: t('dir.takeRamp', { floor: targetFloorName }),
          isTransition: true,
        });
      } else if (edge?.isStairs && curr.floor !== prev.floor) {
        generated.push({
          id: `step-${i}`,
          text: t('dir.takeStairs', { floor: targetFloorName }),
          isTransition: true,
        });
      } else if (i === path.length - 1) {
        generated.push({
          id: `step-${i}`,
          text: t('dir.arrive', { dest: t(curr.nameKey) }),
          isArrive: true,
        });
      } else {
        generated.push({
          id: `step-${i}`,
          text: t('dir.walkStraight', { to: t(curr.nameKey), dist: edge?.distance || 10 }),
        });
      }
    }

    return generated;
  }, [path, t]);

  const handleListenRoute = () => {
    if (!('speechSynthesis' in window)) return;
    const fullText = steps.map((s, idx) => `कदम ${idx + 1}: ${s.text}`).join('. ');
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <SearchIcon className="w-8 h-8 text-emerald-600 flex-shrink-0" />
            <span>{t('map.title')}</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            {t('home.findPlaceDesc')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleListenRoute}
          className="min-h-[56px] px-5 py-2.5 bg-hospital-100 hover:bg-hospital-200 text-hospital-800 dark:bg-hospital-900 dark:text-hospital-200 font-bold rounded-xl border-2 border-hospital-400 flex items-center justify-center gap-2 focus:ring-4 focus:ring-hospital-400 focus:outline-none flex-shrink-0"
        >
          <VolumeIcon className="w-6 h-6 text-hospital-600 dark:text-hospital-300" />
          <span>Listen to Route</span>
        </button>
      </div>

      {/* Avoid Stairs Accessible Switcher */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border-3 border-amber-400 dark:border-amber-600 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-2xl flex-shrink-0">
            {avoidStairs ? '♿' : '🪜'}
          </div>
          <div>
            <p className="font-black text-lg sm:text-xl text-amber-950 dark:text-amber-100">
              {avoidStairs ? t('map.avoidStairsOn') : t('map.avoidStairsOff')}
            </p>
            <p className="text-sm text-amber-900 dark:text-amber-200">
              {avoidStairs ? 'Only ramps and elevators used (no stairs)' : 'Using stairs, lifts, and ramps'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAvoidStairs(!avoidStairs)}
          className={`min-h-[56px] px-6 py-2.5 rounded-xl font-black text-base border-2 flex items-center gap-2 focus:ring-4 focus:ring-hospital-400 focus:outline-none flex-shrink-0 ${
            avoidStairs
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-400'
          }`}
          aria-pressed={avoidStairs}
        >
          {avoidStairs ? <CheckCircleIcon className="w-6 h-6" /> : <StairsIcon className="w-6 h-6" />}
          <span>{avoidStairs ? 'Avoid Stairs (ON)' : 'Avoid Stairs (OFF)'}</span>
        </button>
      </div>

      {/* Start and Destination Selection */}
      <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="find-start-node" className="block font-bold text-base sm:text-lg text-slate-800 dark:text-slate-200 mb-1">
            {t('map.startLocation')}:
          </label>
          <select
            id="find-start-node"
            value={startNodeId}
            onChange={(e) => setStartNodeId(e.target.value)}
            className="w-full min-h-[56px] px-3 py-2 text-base sm:text-lg font-bold rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-4 focus:ring-hospital-400 focus:outline-none"
          >
            <option value="gate_1">Gate 1 (Main Entrance)</option>
            <option value="reg_desk">Registration Desk (Counter 1-4)</option>
            <option value="casualty">Casualty / Emergency (Room E1)</option>
            <option value="g_lift">Ground Floor Lift</option>
            <option value="f1_lift">1st Floor Lift</option>
          </select>
        </div>

        <div>
          <label htmlFor="find-dest-node" className="block font-bold text-base sm:text-lg text-slate-800 dark:text-slate-200 mb-1">
            {t('map.destination')}:
          </label>
          <select
            id="find-dest-node"
            value={destNodeId}
            onChange={(e) => setDestNodeId(e.target.value)}
            className="w-full min-h-[56px] px-3 py-2 text-base sm:text-lg font-bold rounded-xl border-2 border-hospital-500 bg-hospital-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-4 focus:ring-hospital-400 focus:outline-none"
          >
            <optgroup label="Ground Floor (Floor 0)">
              <option value="casualty">Casualty / Emergency (Room E1)</option>
              <option value="reg_desk">OPD Registration Desk (Counters 1-4)</option>
              <option value="g_med_1">General Medicine Room R1 (Dr. Sharma)</option>
              <option value="g_med_2">General Medicine Room R2</option>
              <option value="pharmacy">Pharmacy / Medicine Dispensary</option>
              <option value="g_water">Drinking Water (Ground Floor)</option>
              <option value="g_washroom">Washrooms (Ground Floor)</option>
            </optgroup>
            <optgroup label="First Floor (Floor 1)">
              <option value="ortho_101">Orthopaedics Room R101 (Kamla's Clinic)</option>
              <option value="ortho_102">Ortho Dressing Room R102</option>
              <option value="eye_103">Eye Care Room R103</option>
              <option value="ent_104">ENT Room R104</option>
              <option value="paed_105">Paediatrics Room R105</option>
              <option value="f1_water">Drinking Water (Floor 1)</option>
              <option value="f1_washroom">Washrooms (Floor 1)</option>
            </optgroup>
            <optgroup label="Second Floor (Floor 2)">
              <option value="gynae_201">Gynaecology Room R201</option>
              <option value="skin_203">Dermatology (Skin) Room R203</option>
              <option value="dental_204">Dental Clinic Room R204</option>
              <option value="lab_205">Pathology Lab & Blood Tests R205</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* Floor Tab Switcher */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-base text-slate-700 dark:text-slate-300">
          {t('map.selectFloor')}
        </span>
        <div className="flex-1 grid grid-cols-3 gap-2">
          {FLOORS.map((f) => (
            <button
              key={f.level}
              type="button"
              onClick={() => setCurrentFloor(f.level)}
              className={`min-h-[56px] px-2 py-2 rounded-xl font-black text-sm sm:text-base border-2 transition-all focus:ring-4 focus:ring-hospital-400 focus:outline-none ${
                currentFloor === f.level
                  ? 'bg-hospital-600 text-white border-hospital-700 shadow-md ring-2 ring-hospital-400'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {t(f.shortKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map */}
      <FloorSvgMap
        floor={currentFloor}
        activeNodeId={destNodeId}
        activePath={path}
        onSelectNode={(nodeId) => setDestNodeId(nodeId)}
      />

      {/* Step Directions */}
      <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t('map.routeTitle')}
            </h3>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {t('map.walkTime')}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-500 uppercase">{t('map.totalDistance')}</span>
            <p className="text-2xl sm:text-3xl font-black text-hospital-700 dark:text-hospital-300">
              {totalMeters} {t('map.meters')}
            </p>
          </div>
        </div>

        <ol className="space-y-3">
          {steps.map((step, idx) => (
            <li
              key={step.id}
              className={`p-3.5 rounded-xl border-2 flex items-start gap-3 text-base sm:text-lg ${
                step.isArrive
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 font-bold text-emerald-950 dark:text-emerald-100'
                  : step.isTransition
                  ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400 font-bold text-sky-950 dark:text-sky-100'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              <span className="w-8 h-8 rounded-full bg-hospital-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="flex-1">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

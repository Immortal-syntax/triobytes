/**
 * OPD Saathi – src/lib/store.js
 *
 * Shared Hospital State Layer & React Hook useHospital()
 *
 * Core Features:
 *   - State: tokens/patients, per-department queue order, counters per prefix,
 *            doctor status per room/dept, urgent flags, consult-time history (last 10),
 *            sim clock multiplier, SMS inbox, myToken.
 *   - Persistence: Single-key localStorage synchronization on every mutation.
 *   - Multi-Tab Sync: BroadcastChannel with echo loop prevention and 'storage' event fallback.
 *   - Actions: registerPatient, callNext, markNoShow, sendToEnd, moveToDept,
 *              completeConsult, setDoctorStatus, raiseFlag, markFlagSeen,
 *              addSampleData, setSpeed, resetAll.
 *   - Wait Estimation: estimateWait(token) = (peopleAhead * avgConsultTime) + doctorDelay,
 *                      rounded to 5 minutes, shown as "about".
 *   - Simulated Clock: Smooth virtual clock with multiplier (1x or 10x).
 */

import React, { createContext, useContext, useSyncExternalStore, useState, useEffect, useRef, useCallback } from 'react';
import { DEPARTMENTS, getDepartmentById } from '../data/departments.js';
import { patients as seedPatients, INITIAL_QUEUES } from '../data/patients.js';

// ─── Constants ───────────────────────────────────────────────────────────────
export const STORAGE_KEY = 'opd_hospital_state';
export const BROADCAST_CHANNEL_NAME = 'opd_hospital_channel';

// Unique tab ID for preventing BroadcastChannel echo loops
export const TAB_ID = typeof window !== 'undefined'
  ? 'tab_' + Math.random().toString(36).slice(2, 9)
  : 'node_env';

// In-memory localStorage mock for Node.js test environments
const memoryStorage = {};
export const storageAdapter = {
  getItem(key) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try { return window.localStorage.getItem(key); } catch (e) { return null; }
    }
    return memoryStorage[key] || null;
  },
  setItem(key, value) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try { window.localStorage.setItem(key, value); } catch (e) {}
    }
    memoryStorage[key] = String(value);
  },
  removeItem(key) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try { window.localStorage.removeItem(key); } catch (e) {}
    }
    delete memoryStorage[key];
  },
};

// ─── Audio Synthesizer (Zero external downloads) ────────────────────────────
class WebAudioSounder {
  constructor() {
    this.ctx = null;
    this.alarmInterval = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playChime() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc2.frequency.setValueAtTime(659.25, now + 0.28); // E5

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.3);
      osc2.start(now + 0.28);
      osc2.stop(now + 1.0);
    } catch (e) {}
  }

  startUrgentAlarm() {
    try {
      this.init();
      if (!this.ctx || this.alarmInterval) return;
      const playPulse = () => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      };
      playPulse();
      this.alarmInterval = setInterval(playPulse, 850);
    } catch (e) {}
  }

  stopUrgentAlarm() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }
}

export const sounder = new WebAudioSounder();

// ─── Department normalization helper ─────────────────────────────────────────
export function normalizeDept(dept) {
  if (!dept) return 'medicine';
  const q = String(dept).toLowerCase().trim();
  if (q === 'ortho' || q === 'bones') return 'bones';
  if (q === 'paediatrics' || q === 'paed' || q === 'child' || q === 'children') return 'children';
  if (q === 'gynae' || q === 'women' || q === 'maternity') return 'women';
  if (q === 'eye' || q === 'eyes') return 'eyes';
  if (q === 'dermatology' || q === 'skin') return 'skin';
  if (q === 'ent') return 'ent';
  if (q === 'medicine' || q === 'general_medicine') return 'medicine';
  return q;
}

export function getDeptPrefix(dept) {
  const norm = normalizeDept(dept);
  const map = {
    medicine: 'MED',
    children: 'CHI',
    women:    'WOM',
    bones:    'BON',
    ent:      'ENT',
    eyes:     'EYE',
    skin:     'SKN',
  };
  return map[norm] || norm.slice(0, 3).toUpperCase();
}

// ─── Initial State Generator ────────────────────────────────────────────────
export function createDefaultState() {
  const now = Date.now();

  // Initial consult history seeded from sampleAvgMinutes
  const consultHistory = {
    medicine: [7, 7, 8],
    children: [8, 9, 8],
    women:    [9, 10, 8],
    bones:    [10, 11, 9],
    ent:      [6, 7, 6],
    eyes:     [6, 6, 7],
    skin:     [5, 6, 5],
  };

  // Initial doctor status per department
  const doctorStatus = {
    medicine: 'available',
    children: 'available',
    women:    'available',
    bones:    'available',
    ent:      'available',
    eyes:     'available',
    skin:     'available',
  };

  // Map 25 seed patients to strict state schema
  const patients = seedPatients.map((p, idx) => {
    const dept = normalizeDept(p.department || p.deptId);
    let status = 'waiting';
    if (p.status === 'in-consultation' || p.status === 'inroom') status = 'inroom';
    else if (p.status === 'called') status = 'called';
    else if (p.status === 'completed' || p.status === 'done') status = 'done';
    else if (p.status === 'skipped' || p.status === 'noshow') status = 'noshow';

    const token = p.tokenCode || `${getDeptPrefix(dept)}-${String(p.tokenNumber || idx + 1).padStart(3, '0')}`;

    return {
      id: p.id || `pat_${idx + 1}`,
      token,
      firstName: p.firstName || (p.name ? p.name.split(' ')[0] : 'Patient'),
      age: Number(p.age) || 45,
      gender: p.gender || 'female',
      mobile: p.phone || p.mobile || '9876543210',
      dept,
      status,
      avoidStairs: Boolean(p.avoidStairs),
      createdAt: now - (30 - idx) * 60000,
      calledAt: status === 'inroom' || status === 'called' ? now - 5 * 60000 : null,
      finishedAt: status === 'done' ? now - 1 * 60000 : null,
      isKamlaScenario: Boolean(p.isKamlaScenario || p.firstName === 'Kamla'),
    };
  });

  // Build per-department queue order
  const queueOrder = {
    medicine: [],
    children: [],
    women:    [],
    bones:    [],
    ent:      [],
    eyes:     [],
    skin:     [],
  };

  // Build prefix counters
  const counters = {
    MED: 25,
    CHI: 17,
    WOM: 14,
    BON: 15,
    ENT: 8,
    EYE: 10,
    SKN: 11,
  };

  patients.forEach((p) => {
    if (queueOrder[p.dept]) {
      queueOrder[p.dept].push(p.token);
    }
    const prefix = getDeptPrefix(p.dept);
    const num = parseInt(p.token.split('-')[1], 10);
    if (!isNaN(num) && num > (counters[prefix] || 0)) {
      counters[prefix] = num;
    }
  });

  // Pre-set Kamla as default active token if present
  const kamla = patients.find((p) => p.isKamlaScenario || p.token === 'BON-14' || p.firstName === 'Kamla') || null;

  return {
    patients,
    queueOrder,
    counters,
    doctorStatus,
    urgentFlags: [],
    consultHistory,
    simSpeed: 1,
    simBaseRealTime: now,
    simBaseSimTime: now,
    smsInbox: [],
    myToken: kamla,
  };
}

// ─── The Single Hospital State Store ────────────────────────────────────────
class HospitalStore {
  constructor() {
    this.listeners = new Set();
    this.state = this.loadInitialState();
    this.channel = null;

    if (typeof window !== 'undefined') {
      this.initBroadcastChannel();
      this.initStorageListener();
    }
  }

  loadInitialState() {
    try {
      const raw = storageAdapter.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.patients)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[HospitalStore] Error loading from localStorage:', e);
    }
    const def = createDefaultState();
    this.saveState(def, false);
    return def;
  }

  saveState(nextState, shouldBroadcast = true) {
    this.state = nextState;
    try {
      storageAdapter.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch (e) {
      console.warn('[HospitalStore] Error saving to localStorage:', e);
    }

    if (shouldBroadcast && this.channel) {
      try {
        this.channel.postMessage({
          type: 'HOSPITAL_STATE_SYNC',
          senderId: TAB_ID,
          state: nextState,
        });
      } catch (e) {}
    }

    this.notify();
  }

  initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (!event.data || event.data.senderId === TAB_ID) return;
          if (event.data.type === 'HOSPITAL_STATE_SYNC' && event.data.state) {
            this.state = event.data.state;
            this.notify();
          } else if (event.data.type === 'PLAY_CHIME') {
            sounder.playChime();
          } else if (event.data.type === 'URGENT_ALARM') {
            sounder.startUrgentAlarm();
          }
        };
      } catch (e) {}
    }
  }

  initStorageListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const incoming = JSON.parse(e.newValue);
            if (incoming && Array.isArray(incoming.patients)) {
              this.state = incoming;
              this.notify();
            }
          } catch (err) {}
        }
      });
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try { listener(); } catch (e) {}
    }
  }

  getState() {
    return this.state;
  }

  // ─── Simulated Clock Calculations ──────────────────────────────────────────
  getSimTime() {
    const { simBaseRealTime, simBaseSimTime, simSpeed } = this.state;
    const elapsedReal = Date.now() - (simBaseRealTime || Date.now());
    return (simBaseSimTime || Date.now()) + elapsedReal * (simSpeed || 1);
  }

  getSimDate() {
    return new Date(this.getSimTime());
  }

  getSimTimeString() {
    return this.getSimDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  setSpeed(speed) {
    const currentSim = this.getSimTime();
    const newSpeed = Number(speed) || 1;
    const next = {
      ...this.state,
      simBaseRealTime: Date.now(),
      simBaseSimTime: currentSim,
      simSpeed: newSpeed,
    };
    this.saveState(next);
    return newSpeed;
  }

  // ─── Wait Estimation ───────────────────────────────────────────────────────
  /**
   * estimateWait(token)
   * Formula: peopleAhead x average consultation time of last 10 patients in dept,
   *          plus doctor delay, rounded to 5 minutes, shown as "about".
   */
  estimateWait(tokenOrId) {
    if (!tokenOrId) {
      return { minutes: 0, peopleAhead: 0, text: 'about 0 minutes', formatted: 'about 0 minutes', toString() { return this.text; } };
    }

    const patient = typeof tokenOrId === 'object'
      ? tokenOrId
      : this.state.patients.find((p) => p.token === tokenOrId || p.id === tokenOrId);

    if (!patient) {
      return { minutes: 0, peopleAhead: 0, text: 'about 0 minutes', formatted: 'about 0 minutes', toString() { return this.text; } };
    }

    const dept = normalizeDept(patient.dept);

    // If already inroom or called
    if (patient.status === 'inroom' || patient.status === 'called') {
      return { minutes: 0, peopleAhead: 0, text: 'about 0 minutes', formatted: 'about 0 minutes', toString() { return this.text; } };
    }

    // If completed or noshow
    if (patient.status === 'done' || patient.status === 'noshow') {
      return { minutes: 0, peopleAhead: 0, text: 'completed', formatted: 'completed', toString() { return this.text; } };
    }

    // 1. Calculate people ahead in this department's queueOrder
    const qOrder = this.state.queueOrder[dept] || [];
    const patientIdx = qOrder.indexOf(patient.token);
    let peopleAhead = 0;

    const limit = patientIdx >= 0 ? patientIdx : qOrder.length;
    for (let i = 0; i < limit; i++) {
      const aheadToken = qOrder[i];
      const p = this.state.patients.find((item) => item.token === aheadToken);
      if (p && (p.status === 'waiting' || p.status === 'called' || p.status === 'inroom')) {
        peopleAhead++;
      }
    }

    // 2. Average consultation time from last 10 consult-time history
    const history = this.state.consultHistory[dept] || [];
    let avgConsult = 0;
    if (history.length > 0) {
      avgConsult = history.reduce((sum, val) => sum + val, 0) / history.length;
    } else {
      const deptData = DEPARTMENTS.find((d) => d.id === dept);
      avgConsult = deptData?.sampleAvgMinutes || 7;
    }

    // 3. Doctor's delay from doctor status
    const docStatus = this.state.doctorStatus[dept] || 'available';
    let doctorDelay = 0;

    if (typeof docStatus === 'string') {
      const lower = docStatus.toLowerCase();
      if (lower.startsWith('late by')) {
        const match = lower.match(/late by (\d+)/);
        if (match) doctorDelay = parseInt(match[1], 10);
      } else if (lower.startsWith('break until')) {
        const match = lower.match(/break until (\d{1,2}):(\d{2})/);
        if (match) {
          const simDate = this.getSimDate();
          const target = new Date(simDate);
          target.setHours(parseInt(match[1], 10), parseInt(match[2], 10), 0, 0);
          const diffMs = target.getTime() - simDate.getTime();
          if (diffMs > 0) {
            doctorDelay = Math.round(diffMs / 60000);
          }
        }
      }
    } else if (docStatus && typeof docStatus === 'object') {
      if (docStatus.type === 'late' && typeof docStatus.minutes === 'number') {
        doctorDelay = docStatus.minutes;
      } else if (docStatus.type === 'break' && docStatus.until) {
        const simDate = this.getSimDate();
        const [h, m] = docStatus.until.split(':').map((n) => parseInt(n, 10));
        const target = new Date(simDate);
        target.setHours(h, m, 0, 0);
        const diffMs = target.getTime() - simDate.getTime();
        if (diffMs > 0) doctorDelay = Math.round(diffMs / 60000);
      }
    }

    // 4. Raw wait and 5-minute rounding
    const rawWait = (peopleAhead * avgConsult) + doctorDelay;
    const rounded = (peopleAhead === 0 && doctorDelay === 0)
      ? 0
      : Math.max(5, Math.round(rawWait / 5) * 5);

    const formatted = `about ${rounded} minutes`;

    return {
      minutes: rounded,
      peopleAhead,
      avgConsultTime: Math.round(avgConsult),
      doctorDelay,
      text: formatted,
      formatted,
      toString() { return this.text; },
    };
  }

  // ─── Actions ───────────────────────────────────────────────────────────────
  registerPatient({ firstName, age, gender, mobile, dept, avoidStairs }) {
    const normDept = normalizeDept(dept);
    const prefix = getDeptPrefix(normDept);
    const nextCount = (this.state.counters[prefix] || 0) + 1;
    const token = `${prefix}-${String(nextCount).padStart(3, '0')}`;
    const id = 'pat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const nowSim = this.getSimTime();

    const newPatient = {
      id,
      token,
      firstName: (firstName || 'Patient').trim(),
      age: Number(age) || 45,
      gender: gender || 'female',
      mobile: mobile || '9876543210',
      dept: normDept,
      status: 'waiting',
      avoidStairs: Boolean(avoidStairs),
      createdAt: nowSim,
      calledAt: null,
      finishedAt: null,
    };

    const nextQueueOrder = {
      ...this.state.queueOrder,
      [normDept]: [...(this.state.queueOrder[normDept] || []), token],
    };

    const nextCounters = {
      ...this.state.counters,
      [prefix]: nextCount,
    };

    const sms = {
      id: 'sms_' + Date.now(),
      to: newPatient.mobile,
      token,
      message: `OPD Saathi: Your turn token is ${token} for ${normDept}. Please wait in Waiting Hall.`,
      sentAt: nowSim,
    };

    const next = {
      ...this.state,
      patients: [...this.state.patients, newPatient],
      queueOrder: nextQueueOrder,
      counters: nextCounters,
      smsInbox: [sms, ...this.state.smsInbox],
      myToken: newPatient,
    };

    this.saveState(next);
    return newPatient;
  }

  callNext(dept) {
    const normDept = normalizeDept(dept);
    const qOrder = this.state.queueOrder[normDept] || [];
    const nowSim = this.getSimTime();

    // Find first patient in 'waiting' status
    const waitingToken = qOrder.find((tok) => {
      const p = this.state.patients.find((item) => item.token === tok);
      return p && p.status === 'waiting';
    });

    if (!waitingToken) return null;

    sounder.playChime();
    if (this.channel) {
      try { this.channel.postMessage({ type: 'PLAY_CHIME', senderId: TAB_ID }); } catch (e) {}
    }

    let nextPatients = this.state.patients.map((p) => {
      // Complete currently inroom patient in this department
      if (p.dept === normDept && (p.status === 'inroom' || p.status === 'called')) {
        const duration = p.calledAt ? Math.max(1, Math.round((nowSim - p.calledAt) / 60000)) : 8;
        return { ...p, status: 'done', finishedAt: nowSim, duration };
      }
      // Call the next waiting patient
      if (p.token === waitingToken) {
        return { ...p, status: 'inroom', calledAt: nowSim };
      }
      return p;
    });

    // Update consultHistory if an inroom patient finished
    const prevInroom = this.state.patients.find((p) => p.dept === normDept && (p.status === 'inroom' || p.status === 'called'));
    let nextConsultHistory = this.state.consultHistory;
    if (prevInroom && prevInroom.calledAt) {
      const duration = Math.max(1, Math.round((nowSim - prevInroom.calledAt) / 60000));
      const curList = this.state.consultHistory[normDept] || [];
      nextConsultHistory = {
        ...this.state.consultHistory,
        [normDept]: [...curList.slice(-9), duration],
      };
    }

    const calledPatient = nextPatients.find((p) => p.token === waitingToken);

    const sms = {
      id: 'sms_' + Date.now(),
      to: calledPatient.mobile,
      token: calledPatient.token,
      message: `OPD Saathi: Token ${calledPatient.token}, please proceed inside the doctor's consultation room now.`,
      sentAt: nowSim,
    };

    const next = {
      ...this.state,
      patients: nextPatients,
      consultHistory: nextConsultHistory,
      smsInbox: [sms, ...this.state.smsInbox],
    };

    this.saveState(next);
    return calledPatient;
  }

  markNoShow(tokenCode) {
    const nowSim = this.getSimTime();
    const nextPatients = this.state.patients.map((p) => {
      if (p.token === tokenCode || p.id === tokenCode) {
        return { ...p, status: 'noshow', finishedAt: nowSim };
      }
      return p;
    });

    const next = {
      ...this.state,
      patients: nextPatients,
    };

    this.saveState(next);
  }

  sendToEnd(tokenCode) {
    const patient = this.state.patients.find((p) => p.token === tokenCode || p.id === tokenCode);
    if (!patient) return;

    const dept = patient.dept;
    const curQueue = (this.state.queueOrder[dept] || []).filter((tok) => tok !== patient.token);
    curQueue.push(patient.token);

    const nextPatients = this.state.patients.map((p) => {
      if (p.token === patient.token) {
        return { ...p, status: 'waiting', calledAt: null };
      }
      return p;
    });

    const next = {
      ...this.state,
      patients: nextPatients,
      queueOrder: {
        ...this.state.queueOrder,
        [dept]: curQueue,
      },
    };

    this.saveState(next);
  }

  moveToDept(tokenCode, newDept) {
    const targetDept = normalizeDept(newDept);
    const patient = this.state.patients.find((p) => p.token === tokenCode || p.id === tokenCode);
    if (!patient || patient.dept === targetDept) return;

    const oldDept = patient.dept;
    const oldQueue = (this.state.queueOrder[oldDept] || []).filter((t) => t !== patient.token);
    const newQueue = [...(this.state.queueOrder[targetDept] || []), patient.token];

    const nextPatients = this.state.patients.map((p) => {
      if (p.token === patient.token) {
        return { ...p, dept: targetDept, status: 'waiting', calledAt: null };
      }
      return p;
    });

    const nowSim = this.getSimTime();
    const sms = {
      id: 'sms_' + Date.now(),
      to: patient.mobile,
      token: patient.token,
      message: `OPD Saathi: Your token ${patient.token} has been transferred to ${targetDept} OPD.`,
      sentAt: nowSim,
    };

    const next = {
      ...this.state,
      patients: nextPatients,
      queueOrder: {
        ...this.state.queueOrder,
        [oldDept]: oldQueue,
        [targetDept]: newQueue,
      },
      smsInbox: [sms, ...this.state.smsInbox],
    };

    this.saveState(next);
  }

  completeConsult(tokenCode) {
    const nowSim = this.getSimTime();
    let completedDept = null;
    let completedDuration = 8;

    const nextPatients = this.state.patients.map((p) => {
      const isMatch = tokenCode
        ? (p.token === tokenCode || p.id === tokenCode)
        : (p.status === 'inroom' || p.status === 'called');

      if (isMatch) {
        completedDept = p.dept;
        completedDuration = p.calledAt ? Math.max(1, Math.round((nowSim - p.calledAt) / 60000)) : 8;
        return { ...p, status: 'done', finishedAt: nowSim, duration: completedDuration };
      }
      return p;
    });

    let nextConsultHistory = this.state.consultHistory;
    if (completedDept) {
      const curList = this.state.consultHistory[completedDept] || [];
      nextConsultHistory = {
        ...this.state.consultHistory,
        [completedDept]: [...curList.slice(-9), completedDuration],
      };
    }

    const next = {
      ...this.state,
      patients: nextPatients,
      consultHistory: nextConsultHistory,
    };

    this.saveState(next);
  }

  setDoctorStatus(roomOrDept, status) {
    const dept = normalizeDept(roomOrDept);
    const nextDoctorStatus = {
      ...this.state.doctorStatus,
      [dept]: status,
    };

    const next = {
      ...this.state,
      doctorStatus: nextDoctorStatus,
    };

    this.saveState(next);
  }

  raiseFlag(details = {}) {
    const flag = {
      id: 'flag_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      createdAt: this.getSimTime(),
      from: details.from || (this.state.myToken ? `${this.state.myToken.firstName} (${this.state.myToken.token})` : 'Waiting Area'),
      reason: details.reason || details.notes || 'Patient reported feeling unwell / urgent assistance required.',
      seen: false,
    };

    sounder.startUrgentAlarm();
    if (this.channel) {
      try { this.channel.postMessage({ type: 'URGENT_ALARM', senderId: TAB_ID }); } catch (e) {}
    }

    const next = {
      ...this.state,
      urgentFlags: [flag, ...this.state.urgentFlags],
    };

    this.saveState(next);
    return flag;
  }

  markFlagSeen(flagId) {
    const nextFlags = this.state.urgentFlags.map((f) => (f.id === flagId ? { ...f, seen: true } : f));
    const hasUnseen = nextFlags.some((f) => !f.seen);
    if (!hasUnseen) {
      sounder.stopUrgentAlarm();
    }

    const next = {
      ...this.state,
      urgentFlags: nextFlags,
    };

    this.saveState(next);
  }

  addSampleData(count = 20) {
    const firstNames = ['Mohan', 'Kavita', 'Ravi', 'Sanjay', 'Usha', 'Gita', 'Ajay', 'Deepak', 'Sarita', 'Manish', 'Alok', 'Babita', 'Chandan', 'Dinesh', 'Hemant', 'Jaya', 'Kusum', 'Lata', 'Naveen', 'Om'];
    const depts = ['medicine', 'children', 'women', 'bones', 'ent', 'eyes', 'skin'];
    const nowSim = this.getSimTime();

    let curPatients = [...this.state.patients];
    let curQueueOrder = { ...this.state.queueOrder };
    let curCounters = { ...this.state.counters };

    for (let i = 0; i < count; i++) {
      const dept = depts[i % depts.length];
      const prefix = getDeptPrefix(dept);
      const nextCount = (curCounters[prefix] || 0) + 1;
      curCounters[prefix] = nextCount;
      const token = `${prefix}-${String(nextCount).padStart(3, '0')}`;
      const id = 'pat_sample_' + Date.now() + '_' + i;

      const p = {
        id,
        token,
        firstName: firstNames[i % firstNames.length],
        age: 20 + ((i * 7) % 55),
        gender: i % 2 === 0 ? 'female' : 'male',
        mobile: '98' + String(10000000 + i * 12345).slice(0, 8),
        dept,
        status: 'waiting',
        avoidStairs: i % 3 === 0,
        createdAt: nowSim - (count - i) * 60000,
        calledAt: null,
        finishedAt: null,
      };

      curPatients.push(p);
      curQueueOrder[dept] = [...(curQueueOrder[dept] || []), token];
    }

    const next = {
      ...this.state,
      patients: curPatients,
      queueOrder: curQueueOrder,
      counters: curCounters,
    };

    this.saveState(next);
  }

  resetAll() {
    storageAdapter.removeItem(STORAGE_KEY);
    const def = createDefaultState();
    this.saveState(def);
  }
}

// Global Singleton Instance
export const hospitalStore = new HospitalStore();

// ─── Export estimateWait standalone helper ───────────────────────────────────
export function estimateWait(tokenOrId) {
  return hospitalStore.estimateWait(tokenOrId);
}

// ─── Backward-compatible queues mapper for existing views ────────────────────
export function getQueuesRepresentation(state) {
  const depts = ['medicine', 'children', 'women', 'bones', 'ent', 'eyes', 'skin'];
  const res = {};

  for (const deptId of depts) {
    const tokens = (state.queueOrder[deptId] || []).map((tok) => {
      const p = state.patients.find((item) => item.token === tok);
      if (!p) return null;
      const numMatch = p.token.match(/-(\d+)$/);
      const tokenNumber = numMatch ? parseInt(numMatch[1], 10) : 0;
      return {
        ...p,
        tokenNumber,
        tokenCode: p.token,
        patientName: p.firstName,
        deptId: p.dept,
        status: p.status === 'inroom' ? 'in-consultation' : (p.status === 'done' ? 'completed' : (p.status === 'noshow' ? 'skipped' : 'waiting')),
      };
    }).filter(Boolean);

    const inroomToken = tokens.find((t) => t.status === 'in-consultation');
    const currentToken = inroomToken ? inroomToken.tokenNumber : (tokens[0]?.tokenNumber || 1);

    const docStatus = state.doctorStatus[deptId];
    const docStatusLabel = typeof docStatus === 'string'
      ? docStatus
      : (docStatus?.status || 'available');

    res[deptId] = {
      deptId,
      currentToken,
      doctorStatus: docStatusLabel,
      tokens,
    };
  }

  // Legacy department ID aliases
  res.ortho       = res.bones;
  res.paediatrics = res.children;
  res.gynae       = res.women;
  res.eye         = res.eyes;
  res.dermatology = res.skin;

  return res;
}

// ─── React Hook: useHospital() ───────────────────────────────────────────────
export function useHospital() {
  const state = useSyncExternalStore(
    (callback) => hospitalStore.subscribe(callback),
    () => hospitalStore.getState(),
    () => hospitalStore.getState()
  );

  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [urgentHelpModalOpen, setUrgentHelpModalOpen] = useState(false);

  // Backward-compatible queues object
  const queues = getQueuesRepresentation(state);

  // Backward-compatible urgentAlerts array
  const urgentAlerts = state.urgentFlags.map((f) => ({
    id: f.id,
    patientName: f.from,
    tokenCode: 'Urgent',
    room: f.from,
    notes: f.reason,
    seen: f.seen,
  }));

  // Actions wrapped for React consumers
  const registerPatient = useCallback((details) => hospitalStore.registerPatient(details), []);
  const callNext = useCallback((dept) => hospitalStore.callNext(dept), []);
  const callNextPatient = useCallback((dept) => hospitalStore.callNext(dept), []);
  const markNoShow = useCallback((token) => hospitalStore.markNoShow(token), []);
  const sendToEnd = useCallback((token) => hospitalStore.sendToEnd(token), []);
  const moveToDept = useCallback((token, newDept) => hospitalStore.moveToDept(token, newDept), []);
  const completeConsult = useCallback((token) => hospitalStore.completeConsult(token), []);
  const setDoctorStatus = useCallback((dept, status) => hospitalStore.setDoctorStatus(dept, status), []);
  const raiseFlag = useCallback((details) => hospitalStore.raiseFlag(details), []);
  const markFlagSeen = useCallback((flagId) => hospitalStore.markFlagSeen(flagId), []);
  const addSampleData = useCallback((count) => hospitalStore.addSampleData(count), []);
  const setSpeed = useCallback((speed) => hospitalStore.setSpeed(speed), []);
  const resetAll = useCallback(() => hospitalStore.resetAll(), []);
  const estimateWaitFn = useCallback((tok) => hospitalStore.estimateWait(tok), []);

  const recallPatient = useCallback((deptId) => {
    sounder.playChime();
    const q = queues[normalizeDept(deptId)];
    const inroom = q?.tokens.find((t) => t.status === 'in-consultation');
    return inroom || null;
  }, [queues]);

  const skipCurrentPatient = useCallback((deptId) => {
    const q = queues[normalizeDept(deptId)];
    const inroom = q?.tokens.find((t) => t.status === 'in-consultation');
    if (inroom) {
      hospitalStore.markNoShow(inroom.token);
    }
  }, [queues]);

  const raiseUrgentHelpAlert = useCallback((details) => hospitalStore.raiseFlag(details), []);
  const dismissUrgentAlert = useCallback((id) => hospitalStore.markFlagSeen(id), []);

  const loadKamlaDemo = useCallback(() => {
    const kamla = state.patients.find((p) => p.isKamlaScenario || p.token === 'BON-14' || p.firstName === 'Kamla');
    if (kamla) {
      const next = { ...state, myToken: kamla };
      hospitalStore.saveState(next);
      return kamla;
    }
    return null;
  }, [state]);

  const setMyToken = useCallback((tokenObj) => {
    const next = { ...hospitalStore.getState(), myToken: tokenObj };
    hospitalStore.saveState(next);
  }, []);

  return {
    // State properties
    patients: state.patients,
    tokens: state.patients,
    queueOrder: state.queueOrder,
    counters: state.counters,
    doctorStatus: state.doctorStatus,
    urgentFlags: state.urgentFlags,
    consultHistory: state.consultHistory,
    simSpeed: state.simSpeed,
    smsInbox: state.smsInbox,
    myToken: state.myToken,
    simTime: hospitalStore.getSimTime(),
    getSimTime: () => hospitalStore.getSimTime(),
    getSimDate: () => hospitalStore.getSimDate(),
    getSimTimeString: () => hospitalStore.getSimTimeString(),

    // Backward-compatibility properties
    queues,
    urgentAlerts,
    setMyToken,
    emergencyModalOpen,
    setEmergencyModalOpen,
    urgentHelpModalOpen,
    setUrgentHelpModalOpen,

    // Actions
    registerPatient,
    callNext,
    callNextPatient,
    markNoShow,
    sendToEnd,
    moveToDept,
    completeConsult,
    setDoctorStatus,
    raiseFlag,
    markFlagSeen,
    addSampleData,
    setSpeed,
    resetAll,
    estimateWait: estimateWaitFn,
    recallPatient,
    skipCurrentPatient,
    raiseUrgentHelpAlert,
    dismissUrgentAlert,
    loadKamlaDemo,
  };
}

// Optional Provider wrapper for consistency
const HospitalStoreContext = createContext(null);

export function HospitalProvider({ children }) {
  const hospital = useHospital();
  return React.createElement(HospitalStoreContext.Provider, { value: hospital }, children);
}

export default hospitalStore;

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { INITIAL_QUEUES, INITIAL_URGENT_ALERTS } from '../data/patients.js';
import { DEPARTMENTS, getDepartmentById } from '../data/departments.js';
import { useAccessibility } from './AccessibilityContext.jsx';
import { useI18n } from './I18nContext.jsx';

const HospitalContext = createContext(null);

// Audio Synthesizer using Web Audio API (zero external sound file downloads)
class SoundSynthesizer {
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
      this.ctx.resume();
    }
  }

  // Pleasant hospital announcement chime (Ding-Dong: C5 -> E5)
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

      // First tone: C5 (523.25 Hz)
      osc1.frequency.setValueAtTime(523.25, now);
      // Second tone: E5 (659.25 Hz) after 0.28s
      osc2.frequency.setValueAtTime(659.25, now + 0.28);

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
    } catch (e) {
      console.warn('Audio chime warning:', e);
    }
  }

  // Urgent Emergency siren pulses for staff desk
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
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.35); // drop to A4

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.4);
      };

      playPulse();
      this.alarmInterval = setInterval(playPulse, 850);
    } catch (e) {
      console.warn('Urgent alarm warning:', e);
    }
  }

  stopUrgentAlarm() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }
}

const synth = new SoundSynthesizer();

export function HospitalProvider({ children }) {
  const { speak } = useAccessibility();
  const { t, lang } = useI18n();

  // Load / initialize queues
  const [queues, setQueues] = useState(() => {
    try {
      const saved = localStorage.getItem('opd_queues');
      return saved ? JSON.parse(saved) : INITIAL_QUEUES;
    } catch (e) {
      return INITIAL_QUEUES;
    }
  });

  // Load / initialize active urgent alerts
  const [urgentAlerts, setUrgentAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem('opd_urgent_alerts');
      return saved ? JSON.parse(saved) : INITIAL_URGENT_ALERTS;
    } catch (e) {
      return INITIAL_URGENT_ALERTS;
    }
  });

  // Current user's token (persists across page refresh)
  const [myToken, setMyToken] = useState(() => {
    try {
      const saved = localStorage.getItem('opd_my_token');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Modals visibility
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [urgentHelpModalOpen, setUrgentHelpModalOpen] = useState(false);

  // BroadcastChannel reference
  const channelRef = useRef(null);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('opd_queues', JSON.stringify(queues));
  }, [queues]);

  useEffect(() => {
    localStorage.setItem('opd_urgent_alerts', JSON.stringify(urgentAlerts));
    // If active urgent alerts exist, keep alarm sounding on staff screens
    if (urgentAlerts.length > 0) {
      synth.startUrgentAlarm();
    } else {
      synth.stopUrgentAlarm();
    }
  }, [urgentAlerts]);

  useEffect(() => {
    if (myToken) {
      localStorage.setItem('opd_my_token', JSON.stringify(myToken));
    } else {
      localStorage.removeItem('opd_my_token');
    }
  }, [myToken]);

  // Setup BroadcastChannel for cross-tab real-time synchronization
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('opd_saathi_channel');
      channelRef.current = bc;

      bc.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'STATE_UPDATE') {
          if (payload.queues) setQueues(payload.queues);
          if (payload.urgentAlerts) setUrgentAlerts(payload.urgentAlerts);
        } else if (type === 'CALL_TOKEN') {
          synth.playChime();
          // If called token is myToken, speak announcement!
          if (payload.tokenCode) {
            setQueues(payload.newQueues);
            if (payload.myTokenCode && myToken && myToken.tokenCode === payload.tokenCode) {
              const msg = lang === 'hi'
                ? `टोकन नंबर ${payload.tokenCode}, कृपया कमरा नंबर ${payload.room} में डॉक्टर के पास जाएँ।`
                : `Token number ${payload.tokenCode}, please proceed to room ${payload.room}.`;
              speak(msg);
            }
          }
        } else if (type === 'URGENT_ALERT_SOUND') {
          synth.startUrgentAlarm();
        }
      };

      return () => {
        bc.close();
      };
    }
  }, [myToken, lang, speak]);

  // Broadcast helper
  const broadcast = useCallback((type, payload) => {
    if (channelRef.current) {
      channelRef.current.postMessage({ type, payload });
    }
  }, []);

  // Register a new patient
  const registerPatient = useCallback(({ name, age, gender, deptId, avoidStairs, mobile }) => {
    synth.init();
    const dept = getDepartmentById(deptId);
    const currentQ = queues[deptId] || { currentToken: 1, doctorStatus: 'available', tokens: [] };
    
    // Generate next token number
    const maxExisting = currentQ.tokens.reduce((acc, t) => Math.max(acc, t.tokenNumber), currentQ.currentToken);
    const nextTokenNum = maxExisting + 1;
    const prefix = deptId.slice(0, 4).toUpperCase();
    const tokenCode = `${prefix}-${nextTokenNum}`;

    const now = new Date();
    const timeIssued = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newToken = {
      tokenNumber: nextTokenNum,
      tokenCode,
      patientName: name.trim(),
      age: Number(age),
      gender: gender || 'female',
      mobile: mobile ? mobile.trim() : '',
      deptId,
      room: dept.room,
      floor: dept.floor,
      doctorName: dept.doctorName,
      avoidStairs: Boolean(avoidStairs),
      status: 'waiting',
      timeIssued,
      dateIssued: now.toLocaleDateString(),
    };

    const updatedQueues = {
      ...queues,
      [deptId]: {
        ...currentQ,
        tokens: [...currentQ.tokens, newToken],
      },
    };

    setQueues(updatedQueues);
    setMyToken(newToken);
    broadcast('STATE_UPDATE', { queues: updatedQueues });

    return newToken;
  }, [queues, broadcast]);

  // Call next patient in department
  const callNextPatient = useCallback((deptId) => {
    synth.init();
    synth.playChime();

    const dept = getDepartmentById(deptId);
    const currentQ = queues[deptId];
    if (!currentQ) return;

    // Find the next waiting token
    const waitingTokens = currentQ.tokens.filter(t => t.status === 'waiting');
    if (waitingTokens.length === 0) return;

    const nextToken = waitingTokens[0];
    const updatedTokens = currentQ.tokens.map(t => {
      if (t.tokenCode === nextToken.tokenCode) {
        return { ...t, status: 'in-consultation' };
      }
      if (t.tokenNumber === currentQ.currentToken && t.status === 'in-consultation') {
        return { ...t, status: 'completed' };
      }
      return t;
    });

    const updatedQueues = {
      ...queues,
      [deptId]: {
        ...currentQ,
        currentToken: nextToken.tokenNumber,
        tokens: updatedTokens,
      },
    };

    setQueues(updatedQueues);
    broadcast('CALL_TOKEN', {
      deptId,
      tokenCode: nextToken.tokenCode,
      room: dept.room,
      newQueues: updatedQueues,
      myTokenCode: myToken?.tokenCode,
    });

    // Voice announcement
    const msg = lang === 'hi'
      ? `टोकन नंबर ${nextToken.tokenCode}, कमरा नंबर ${dept.room}।`
      : `Token number ${nextToken.tokenCode}, Room ${dept.room}.`;
    speak(msg);
  }, [queues, myToken, lang, speak, broadcast]);

  // Recall current patient
  const recallPatient = useCallback((deptId) => {
    synth.init();
    synth.playChime();

    const dept = getDepartmentById(deptId);
    const currentQ = queues[deptId];
    if (!currentQ) return;

    const currentTokenObj = currentQ.tokens.find(t => t.tokenNumber === currentQ.currentToken);
    const tokenCode = currentTokenObj ? currentTokenObj.tokenCode : `${deptId.toUpperCase()}-${currentQ.currentToken}`;

    const msg = lang === 'hi'
      ? `टोकन नंबर ${tokenCode}, कमरा नंबर ${dept.room} में डॉक्टर के पास आएँ।`
      : `Token number ${tokenCode}, please proceed to Room ${dept.room}.`;
    speak(msg);

    broadcast('CALL_TOKEN', {
      deptId,
      tokenCode,
      room: dept.room,
      newQueues: queues,
      myTokenCode: myToken?.tokenCode,
    });
  }, [queues, myToken, lang, speak, broadcast]);

  // Mark token skipped / absent
  const skipCurrentPatient = useCallback((deptId) => {
    const currentQ = queues[deptId];
    if (!currentQ) return;

    const updatedTokens = currentQ.tokens.map(t => {
      if (t.tokenNumber === currentQ.currentToken && t.status === 'in-consultation') {
        return { ...t, status: 'skipped' };
      }
      return t;
    });

    const updatedQueues = {
      ...queues,
      [deptId]: {
        ...currentQ,
        tokens: updatedTokens,
      },
    };

    setQueues(updatedQueues);
    broadcast('STATE_UPDATE', { queues: updatedQueues });
  }, [queues, broadcast]);

  // Toggle doctor status: 'available' | 'break'
  const setDoctorStatus = useCallback((deptId, status) => {
    const currentQ = queues[deptId];
    if (!currentQ) return;

    const updatedQueues = {
      ...queues,
      [deptId]: {
        ...currentQ,
        doctorStatus: status,
      },
    };

    setQueues(updatedQueues);
    broadcast('STATE_UPDATE', { queues: updatedQueues });
  }, [queues, broadcast]);

  // Raise Urgent Help Alert (Patient pressed "I Need Urgent Help")
  const raiseUrgentHelpAlert = useCallback((details = {}) => {
    synth.init();
    synth.startUrgentAlarm();

    const newAlert = {
      id: 'alert-' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      tokenCode: myToken ? myToken.tokenCode : 'Visitor',
      patientName: myToken ? myToken.patientName : 'Unregistered Patient',
      department: myToken ? myToken.deptId : 'Waiting Area',
      room: myToken ? myToken.room : 'Ground Floor Lobby',
      notes: details.notes || 'Patient reported feeling unwell / urgent assistance required.',
      handled: false,
    };

    const updatedAlerts = [newAlert, ...urgentAlerts];
    setUrgentAlerts(updatedAlerts);
    broadcast('STATE_UPDATE', { urgentAlerts: updatedAlerts });
    broadcast('URGENT_ALERT_SOUND', {});
  }, [myToken, urgentAlerts, broadcast]);

  // Dismiss / Mark Seen Urgent Alert (Staff action)
  const dismissUrgentAlert = useCallback((alertId) => {
    const updatedAlerts = urgentAlerts.filter(a => a.id !== alertId);
    setUrgentAlerts(updatedAlerts);
    broadcast('STATE_UPDATE', { urgentAlerts: updatedAlerts });
    if (updatedAlerts.length === 0) {
      synth.stopUrgentAlarm();
    }
  }, [urgentAlerts, broadcast]);

  // Switch demo directly to Kamla Devi scenario
  const loadKamlaDemo = useCallback(() => {
    synth.init();
    const orthoQueue = queues.ortho;
    const kamlaToken = orthoQueue.tokens.find(t => t.isKamlaScenario) || {
      tokenNumber: 14,
      tokenCode: 'ORTHO-14',
      patientName: 'Kamla',
      age: 62,
      gender: 'female',
      deptId: 'ortho',
      room: 'R101',
      floor: 1,
      doctorName: 'Dr. Anand Kulkarni',
      avoidStairs: true,
      status: 'waiting',
      timeIssued: '09:20 AM',
      dateIssued: new Date().toLocaleDateString(),
    };

    setMyToken(kamlaToken);
    return kamlaToken;
  }, [queues]);

  return (
    <HospitalContext.Provider
      value={{
        queues,
        urgentAlerts,
        myToken,
        setMyToken,
        registerPatient,
        callNextPatient,
        recallPatient,
        skipCurrentPatient,
        setDoctorStatus,
        raiseUrgentHelpAlert,
        dismissUrgentAlert,
        loadKamlaDemo,
        emergencyModalOpen,
        setEmergencyModalOpen,
        urgentHelpModalOpen,
        setUrgentHelpModalOpen,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
}

export function useHospital() {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
}

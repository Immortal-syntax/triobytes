import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n/useT.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { useHospital } from '../context/HospitalContext.jsx';
import { useAccessibility } from '../context/AccessibilityContext.jsx';
import {
  EmergencyCrossIcon,
  AlertIcon,
  PhoneIcon,
  CheckCircleIcon,
  InfoIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  MapPinIcon,
  CloseIcon,
  UserIcon,
} from '../components/common/Icons.jsx';

// Inline SVGs for the 8 Emergency Signs
function HeartCrackIcon({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="m12 5-1 4 3 2-2 4 2 3" />
    </svg>
  );
}

function LungsIcon({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4v8" />
      <path d="M12 9c-2-1-4-2-6-1a5 5 0 0 0-4 5c0 4 2 8 6 8 2 0 4-2 4-5V9Z" />
      <path d="M12 9c2-1 4-2 6-1a5 5 0 0 1 4 5c0 4-2 8-6 8-2 0-4-2-4-5V9Z" />
    </svg>
  );
}

function BloodDropIcon({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 11v4M12 18h.01" />
    </svg>
  );
}

function FaintingIcon({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="8" y1="9" x2="10" y2="11" />
      <line x1="10" y1="9" x2="8" y2="11" />
      <line x1="14" y1="9" x2="16" y2="11" />
      <line x1="16" y1="9" x2="14" y2="11" />
      <path d="M8 16c1.5-1 3.5-1 5 0" />
      <path d="M17 5l2-2M19 8l2-1" />
    </svg>
  );
}

function DroopingFaceIcon({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" />
      <circle cx="15" cy="10.5" r="1.5" fill="currentColor" />
      <path d="M8 15c2 1 4 0 6-2" />
      <path d="M12 2v20" strokeDasharray="2 2" strokeOpacity="0.4" />
    </svg>
  );
}

function SeriousInjuryIcon({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="7" width="18" height="10" rx="4" />
      <line x1="10" y1="7" x2="14" y2="17" />
      <line x1="14" y1="7" x2="10" y2="17" />
      <circle cx="7" cy="12" r="1" fill="currentColor" />
      <circle cx="17" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

function PregnantEmergencyIcon({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="4" r="2.5" />
      <path d="M9 8.5c1-1 3.5-1 4.5 0 2 2 4 4.5 2 8-1 1.7-2.5 2.5-4 2.5s-2.5-.5-3.5-1.5L7 16" />
      <path d="M13 13a4 4 0 0 1-2 4" />
      <path d="M19 10l2 2-2 2" />
    </svg>
  );
}

function UnwellChildIcon({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="7" r="3.5" />
      <path d="M7 19v-4a4 4 0 0 1 8 0v4" />
      <path d="M9 19h6" />
      <line x1="18" y1="4" x2="18" y2="10" />
      <circle cx="18" cy="11.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

// Inline SVGs for the Doctor Specialty Cards
function DoctorMedicineIcon({ className = "w-10 h-10" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 3v5a5.5 5.5 0 0 0 11 0V3M8 14v1a4 4 0 0 0 8 0v-1M12 18v3M10 21h4" />
      <circle cx="19" cy="10" r="2" />
    </svg>
  );
}

function DoctorChildIcon({ className = "w-10 h-10" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
      <path d="M10 8h.01M14 8h.01" />
      <path d="M11 10.5c.5.5 1.5.5 2 0" />
      <path d="M12 2v2" />
    </svg>
  );
}

function DoctorPregnancyIcon({ className = "w-10 h-10" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="5" r="3" />
      <path d="M9 9.5c1-1 3.5-1 4.5 0 2 2 4 4.5 2 8-1 1.7-2.5 2.5-4 2.5s-2.5-.5-3.5-1.5L7 17" />
      <path d="M13 14a4 4 0 0 1-2 4" />
    </svg>
  );
}

function DoctorBonesIcon({ className = "w-10 h-10" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 10c.7-.7 1.6-1 2.5-.7 1.8.6 2.3 2.8 1 4.1-.7.7-1 1.6-.7 2.5.6 1.8-1.6 4-3.4 3.4-.9-.3-1.8 0-2.5.7l-7.2-7.2c.7-.7 1-1.6.7-2.5-.6-1.8 1.6-4 3.4-3.4.9.3 1.8 0 2.5-.7z" />
    </svg>
  );
}

function DoctorEntIcon({ className = "w-10 h-10" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 4-3 7-5 8.5v2.5M10 19.5h4" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}

function DoctorEyesIcon({ className = "w-10 h-10" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 9a3 3 0 0 1 3 3" />
    </svg>
  );
}

function DoctorSkinIcon({ className = "w-10 h-10" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.15" />
      <path d="M7 7l2 2M15 15l2 2M17 7l-2 2M9 15l-2 2" />
    </svg>
  );
}

// Microphone / Speech Recognition Icon
function MicIcon({ className = "w-6 h-6", isListening = false }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" fill={isListening ? "currentColor" : "none"} />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}

export default function RegistrationPage() {
  const { t, language } = useT();
  const { registerPatient, setUrgentHelpModalOpen } = useHospital();
  const { speak } = useAccessibility();
  const { assistedMode, setAssistedMode, avoidStairs } = useSettings();
  const navigate = useNavigate();

  // Screen / Step tracking: 0 = First Screen (Emergency Triage), 1..5 = Question Steps
  const [step, setStep] = useState(0);

  // Persistent Draft State (holds all answers across Back/Forward navigation)
  const [draft, setDraft] = useState({
    name: '',
    age: '',
    gender: 'female', // Default female for Kamla profile comfort
    mobile: '',
    deptId: '',
    avoidStairs: avoidStairs !== undefined ? avoidStairs : true,
  });

  const [errors, setErrors] = useState({});
  const [helpDeskModalOpen, setHelpDeskModalOpen] = useState(false);
  const [listeningField, setListeningField] = useState(null);

  // Check if Web Speech Recognition is supported in this browser
  const isSpeechSupported = typeof window !== 'undefined' && Boolean(
    window.SpeechRecognition || window.webkitSpeechRecognition
  );

  const recognitionRef = useRef(null);

  // Handle Speech Recognition for text questions (Name, Age, Mobile)
  const toggleListening = (fieldName) => {
    if (!isSpeechSupported) return;

    if (listeningField === fieldName) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setListeningField(null);
      return;
    }

    try {
      const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechClass();
      rec.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => {
        setListeningField(fieldName);
      };

      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        if (fieldName === 'name') {
          setDraft((prev) => ({ ...prev, name: text.trim() }));
          setErrors((prev) => ({ ...prev, name: null }));
        } else if (fieldName === 'age') {
          const numbers = text.replace(/\D/g, '');
          if (numbers) {
            setDraft((prev) => ({ ...prev, age: numbers }));
            setErrors((prev) => ({ ...prev, age: null }));
          } else {
            setDraft((prev) => ({ ...prev, age: text.trim() }));
          }
        } else if (fieldName === 'mobile') {
          const digits = text.replace(/\D/g, '');
          if (digits) {
            setDraft((prev) => ({ ...prev, mobile: digits.slice(-10) }));
            setErrors((prev) => ({ ...prev, mobile: null }));
          }
        }
        setListeningField(null);
      };

      rec.onerror = () => {
        setListeningField(null);
      };

      rec.onend = () => {
        setListeningField(null);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setListeningField(null);
    }
  };

  // Assisted Mode: Read aloud current screen automatically when step changes
  useEffect(() => {
    if (!assistedMode) return;

    if (step === 0) {
      speak(`${t('register.triageTitle')}. ${t('register.emergencyNoticeBold')}`);
    } else if (step === 1) {
      speak(`${t('register.stepProgress', { current: 1, total: 5 })}. ${t('register.step1Title')}. ${t('register.step1Desc')}`);
    } else if (step === 2) {
      speak(`${t('register.stepProgress', { current: 2, total: 5 })}. ${t('register.step2Title')}. ${t('register.step2Desc')}`);
    } else if (step === 3) {
      speak(`${t('register.stepProgress', { current: 3, total: 5 })}. ${t('register.step3Title')}`);
    } else if (step === 4) {
      speak(`${t('register.stepProgress', { current: 4, total: 5 })}. ${t('register.step4Title')}. ${t('register.privacyGuarantee')}`);
    } else if (step === 5) {
      speak(`${t('register.stepProgress', { current: 5, total: 5 })}. ${t('register.step5Title')}. ${t('register.step5Desc')}`);
    }
  }, [step, assistedMode, language, speak, t]);

  // Validation per step
  const validateCurrentStep = () => {
    const errs = {};

    if (step === 1) {
      if (!draft.name || !draft.name.trim()) {
        errs.name = t('register.errorName');
      }
    } else if (step === 2) {
      const num = Number(draft.age);
      if (!draft.age || isNaN(num) || num <= 0 || num > 125) {
        errs.age = t('register.errorAge');
      }
    } else if (step === 3) {
      if (!draft.gender) {
        errs.gender = t('register.errorGender');
      }
    } else if (step === 4) {
      // Optional, but if provided must be exactly 10 digits
      if (draft.mobile && draft.mobile.trim().length > 0) {
        const cleanMobile = draft.mobile.replace(/\D/g, '');
        if (cleanMobile.length !== 10) {
          errs.mobile = t('register.errorMobile');
        }
      }
    } else if (step === 5) {
      if (!draft.deptId) {
        errs.deptId = t('register.errorDept');
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  const handleFinish = (e) => {
    if (e) e.preventDefault();
    if (!validateCurrentStep()) return;

    const newToken = registerPatient({
      name: draft.name,
      age: draft.age,
      gender: draft.gender,
      mobile: draft.mobile,
      deptId: draft.deptId,
      avoidStairs: draft.avoidStairs,
    });

    navigate(`/slip/${newToken.tokenCode}`);
  };

  // Emergency Signs List for Screen 0
  const emergencySigns = [
    {
      id: 'chest_pain',
      titleKey: 'register.signChestPain',
      descKey: 'register.signChestPainDesc',
      Icon: HeartCrackIcon,
    },
    {
      id: 'trouble_breathing',
      titleKey: 'register.signTroubleBreathing',
      descKey: 'register.signTroubleBreathingDesc',
      Icon: LungsIcon,
    },
    {
      id: 'heavy_bleeding',
      titleKey: 'register.signHeavyBleeding',
      descKey: 'register.signHeavyBleedingDesc',
      Icon: BloodDropIcon,
    },
    {
      id: 'fainting',
      titleKey: 'register.signFainting',
      descKey: 'register.signFaintingDesc',
      Icon: FaintingIcon,
    },
    {
      id: 'drooping_face',
      titleKey: 'register.signWeaknessOrDroop',
      descKey: 'register.signWeaknessOrDroopDesc',
      Icon: DroopingFaceIcon,
    },
    {
      id: 'serious_injury',
      titleKey: 'register.signSeriousInjury',
      descKey: 'register.signSeriousInjuryDesc',
      Icon: SeriousInjuryIcon,
    },
    {
      id: 'pregnant_emergency',
      titleKey: 'register.signPregnantEmergency',
      descKey: 'register.signPregnantEmergencyDesc',
      Icon: PregnantEmergencyIcon,
    },
    {
      id: 'unwell_child',
      titleKey: 'register.signUnwellChild',
      descKey: 'register.signUnwellChildDesc',
      Icon: UnwellChildIcon,
    },
  ];

  // Doctor Picture Cards for Step 5
  const doctorCards = [
    {
      id: 'medicine',
      titleKey: 'register.deptGeneralMedicine',
      plainKey: 'register.deptGeneralMedicinePlain',
      room: 'R1 (Ground Floor)',
      Icon: DoctorMedicineIcon,
      color: 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200',
      activeRing: 'ring-4 ring-emerald-500 border-emerald-600',
    },
    {
      id: 'paediatrics',
      titleKey: 'register.deptChildren',
      plainKey: 'register.deptChildrenPlain',
      room: 'R105 (1st Floor)',
      Icon: DoctorChildIcon,
      color: 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200',
      activeRing: 'ring-4 ring-purple-500 border-purple-600',
    },
    {
      id: 'gynae',
      titleKey: 'register.deptWomen',
      plainKey: 'register.deptWomenPlain',
      room: 'R201 (2nd Floor)',
      Icon: DoctorPregnancyIcon,
      color: 'border-pink-500 bg-pink-50/70 dark:bg-pink-950/40 text-pink-900 dark:text-pink-200',
      activeRing: 'ring-4 ring-pink-500 border-pink-600',
    },
    {
      id: 'ortho',
      titleKey: 'register.deptBones',
      plainKey: 'register.deptBonesPlain',
      room: 'R101 (1st Floor)',
      Icon: DoctorBonesIcon,
      color: 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200',
      activeRing: 'ring-4 ring-amber-500 border-amber-600',
    },
    {
      id: 'ent',
      titleKey: 'register.deptEnt',
      plainKey: 'register.deptEntPlain',
      room: 'R104 (1st Floor)',
      Icon: DoctorEntIcon,
      color: 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200',
      activeRing: 'ring-4 ring-blue-500 border-blue-600',
    },
    {
      id: 'eye',
      titleKey: 'register.deptEyes',
      plainKey: 'register.deptEyesPlain',
      room: 'R103 (1st Floor)',
      Icon: DoctorEyesIcon,
      color: 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-200',
      activeRing: 'ring-4 ring-cyan-500 border-cyan-600',
    },
    {
      id: 'dermatology',
      titleKey: 'register.deptSkin',
      plainKey: 'register.deptSkinPlain',
      room: 'R203 (2nd Floor)',
      Icon: DoctorSkinIcon,
      color: 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200',
      activeRing: 'ring-4 ring-orange-500 border-orange-600',
    },
  ];

  /* ==================================================================== */
  /* SCREEN 0: FIRST SCREEN (Emergency Triage / Signs Check)              */
  /* ==================================================================== */
  if (step === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        {/* Title & Introduction Banner */}
        <div className="bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-800 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emergency-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <EmergencyCrossIcon className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {t('register.triageTitle')}
              </h2>
              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 font-medium mt-1">
                {t('register.triageSubtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* 8 Emergency Signs Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          role="region"
          aria-label={t('register.triageTitle')}
        >
          {emergencySigns.map((sign) => {
            const SignIcon = sign.Icon;
            return (
              <div
                key={sign.id}
                className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800/90 border-2 border-rose-200 dark:border-rose-900/60 shadow-sm"
              >
                <div className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-900/70 text-emergency-600 dark:text-rose-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <SignIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                    {t(sign.titleKey)}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5 font-medium leading-relaxed">
                    {t(sign.descKey)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Beneath it, in bold: Any of these? Go to Emergency now. You don't need a token. */}
        <div className="bg-emergency-600 text-white p-5 sm:p-6 rounded-3xl shadow-xl text-center space-y-4 border-2 border-emergency-700">
          <p className="font-black text-xl sm:text-2xl tracking-wide leading-snug">
            {t('register.emergencyNoticeBold')}
          </p>

          <div className="flex flex-col gap-3 pt-1">
            {/* Big red Emergency button */}
            <button
              id="btn-emergency-action"
              type="button"
              onClick={() => navigate('/emergency')}
              className="w-full min-h-[58px] py-4 px-6 bg-white hover:bg-slate-100 active:bg-slate-200 text-emergency-700 font-black text-xl sm:text-2xl rounded-2xl flex items-center justify-center gap-3 shadow-lg focus:ring-4 focus:ring-amber-300 focus:outline-none transition-transform active:scale-95"
            >
              <EmergencyCrossIcon className="w-7 h-7 text-emergency-600 animate-pulse" />
              <span>{t('register.emergencyBtn')}</span>
            </button>

            {/* "I need urgent help" button */}
            <button
              id="btn-urgent-help-action"
              type="button"
              onClick={() => setUrgentHelpModalOpen(true)}
              className="w-full min-h-[54px] py-3.5 px-6 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-amber-950 font-black text-lg sm:text-xl rounded-2xl flex items-center justify-center gap-3 shadow-md focus:ring-4 focus:ring-white focus:outline-none transition-transform active:scale-95"
            >
              <AlertIcon className="w-6 h-6 text-amber-950" />
              <span>{t('register.urgentHelpBtn')}</span>
            </button>
          </div>
        </div>

        {/* Smaller "None of these, continue" button goes on */}
        <div className="pt-2 text-center">
          <button
            id="btn-triage-continue"
            type="button"
            onClick={() => setStep(1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[52px] py-3 px-8 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-lg rounded-2xl shadow-md focus:ring-4 focus:ring-hospital-400 focus:outline-none transition-all active:scale-95"
          >
            <span>{t('register.continueBtn')}</span>
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  /* ==================================================================== */
  /* STEPS 1 TO 5: WIZARD WITH PROGRESS BAR, BACK BUTTON & DRAFT STORAGE  */
  /* ==================================================================== */
  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">
      {/* Top Header Card: Progress Bar & "Someone is helping me" switch */}
      <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Assisted Mode Switch */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
          <label
            htmlFor="assisted-mode-toggle"
            className="flex items-center gap-3 cursor-pointer select-none text-left"
          >
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                id="assisted-mode-toggle"
                type="checkbox"
                role="switch"
                checked={assistedMode}
                onChange={(e) => {
                  const val = e.target.checked;
                  setAssistedMode(val);
                  if (val) {
                    speak(t('register.assistedModeNotice'));
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-hospital-300 dark:peer-focus:ring-hospital-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-hospital-600"></div>
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white block">
                {t('register.someoneHelping')}
              </span>
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 block font-medium">
                {assistedMode ? 'Assisted mode ON' : 'Helper can fill in & read aloud'}
              </span>
            </div>
          </label>
        </div>

        {/* Progress Bar: "Step X of 5" */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-base sm:text-lg font-black text-hospital-800 dark:text-hospital-300">
            <span>{t('register.stepProgress', { current: step, total: 5 })}</span>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
              {step === 1 && t('register.step1Title')}
              {step === 2 && t('register.step2Title')}
              {step === 3 && t('register.step3Title')}
              {step === 4 && t('register.step4Title')}
              {step === 5 && t('register.step5Title')}
            </span>
          </div>
          <div
            className="w-full bg-slate-100 dark:bg-slate-900 h-3.5 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700"
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin="1"
            aria-valuemax="5"
            aria-label="Registration Progress"
          >
            <div
              className="bg-hospital-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {assistedMode && (
          <div className="bg-hospital-50 dark:bg-hospital-950/60 border border-hospital-200 dark:border-hospital-800 p-3 rounded-xl flex items-start gap-2.5 text-hospital-900 dark:text-hospital-200 text-sm sm:text-base font-semibold">
            <InfoIcon className="w-5 h-5 text-hospital-600 flex-shrink-0 mt-0.5" />
            <p>{t('register.assistedModeNotice')}</p>
          </div>
        )}
      </div>

      {/* Main Question Card: One question per screen */}
      <div className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
        {/* ============================================================== */}
        {/* STEP 1: PATIENT NAME                                           */}
        {/* ============================================================== */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className={`font-black text-slate-900 dark:text-white ${assistedMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
                {t('register.step1Title')} <span className="text-emergency-600">*</span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-1 font-medium">
                {t('register.step1Desc')}
              </p>
            </div>

            <div className="relative">
              <label htmlFor="input-patient-name" className="sr-only">
                {t('register.step1Title')}
              </label>
              <input
                id="input-patient-name"
                type="text"
                value={draft.name}
                onChange={(e) => {
                  setDraft((prev) => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                }}
                placeholder={t('register.namePlaceholder')}
                autoFocus
                className={`w-full min-h-[60px] px-4 text-xl sm:text-2xl rounded-2xl border-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-4 focus:ring-hospital-400 focus:outline-none ${
                  isSpeechSupported ? 'pr-16' : ''
                } ${errors.name ? 'border-emergency-500 bg-emergency-50/20' : 'border-slate-300 dark:border-slate-600'}`}
                aria-required="true"
                aria-invalid={errors.name ? 'true' : 'false'}
              />

              {/* Big microphone button using Web Speech API (hide if unsupported) */}
              {isSpeechSupported && (
                <button
                  type="button"
                  id="mic-btn-name"
                  onClick={() => toggleListening('name')}
                  className={`absolute right-2 top-2 bottom-2 w-12 rounded-xl flex items-center justify-center transition-all focus:ring-4 focus:ring-hospital-400 focus:outline-none ${
                    listeningField === 'name'
                      ? 'bg-emergency-600 text-white animate-pulse ring-4 ring-emergency-300'
                      : 'bg-hospital-100 hover:bg-hospital-200 dark:bg-hospital-900/60 text-hospital-700 dark:text-hospital-300'
                  }`}
                  aria-label={listeningField === 'name' ? t('register.micStop') : t('register.micListen')}
                  title={listeningField === 'name' ? t('register.micStop') : t('register.micListen')}
                >
                  <MicIcon className="w-6 h-6" isListening={listeningField === 'name'} />
                </button>
              )}
            </div>

            {listeningField === 'name' && (
              <p className="text-emergency-600 dark:text-emergency-400 font-bold text-sm sm:text-base flex items-center gap-1.5 animate-pulse">
                <span className="w-3 h-3 rounded-full bg-emergency-600"></span>
                <span>{t('register.micListening')}</span>
              </p>
            )}

            {errors.name && (
              <p className="text-emergency-600 font-bold text-base mt-1" role="alert">
                ⚠️ {errors.name}
              </p>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: PATIENT AGE                                            */}
        {/* ============================================================== */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className={`font-black text-slate-900 dark:text-white ${assistedMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
                {t('register.step2Title')} <span className="text-emergency-600">*</span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-1 font-medium">
                {t('register.step2Desc')}
              </p>
            </div>

            <div className="relative">
              <label htmlFor="input-patient-age" className="sr-only">
                {t('register.step2Title')}
              </label>
              <input
                id="input-patient-age"
                type="number"
                inputMode="numeric"
                min="1"
                max="125"
                value={draft.age}
                onChange={(e) => {
                  setDraft((prev) => ({ ...prev, age: e.target.value }));
                  if (errors.age) setErrors((prev) => ({ ...prev, age: null }));
                }}
                placeholder={t('register.agePlaceholder')}
                autoFocus
                className={`w-full min-h-[60px] px-4 text-xl sm:text-2xl rounded-2xl border-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-4 focus:ring-hospital-400 focus:outline-none ${
                  isSpeechSupported ? 'pr-16' : ''
                } ${errors.age ? 'border-emergency-500 bg-emergency-50/20' : 'border-slate-300 dark:border-slate-600'}`}
                aria-required="true"
                aria-invalid={errors.age ? 'true' : 'false'}
              />

              {/* Big microphone button using Web Speech API (hide if unsupported) */}
              {isSpeechSupported && (
                <button
                  type="button"
                  id="mic-btn-age"
                  onClick={() => toggleListening('age')}
                  className={`absolute right-2 top-2 bottom-2 w-12 rounded-xl flex items-center justify-center transition-all focus:ring-4 focus:ring-hospital-400 focus:outline-none ${
                    listeningField === 'age'
                      ? 'bg-emergency-600 text-white animate-pulse ring-4 ring-emergency-300'
                      : 'bg-hospital-100 hover:bg-hospital-200 dark:bg-hospital-900/60 text-hospital-700 dark:text-hospital-300'
                  }`}
                  aria-label={listeningField === 'age' ? t('register.micStop') : t('register.micListen')}
                  title={listeningField === 'age' ? t('register.micStop') : t('register.micListen')}
                >
                  <MicIcon className="w-6 h-6" isListening={listeningField === 'age'} />
                </button>
              )}
            </div>

            {listeningField === 'age' && (
              <p className="text-emergency-600 dark:text-emergency-400 font-bold text-sm sm:text-base flex items-center gap-1.5 animate-pulse">
                <span className="w-3 h-3 rounded-full bg-emergency-600"></span>
                <span>{t('register.micListening')}</span>
              </p>
            )}

            {errors.age && (
              <p className="text-emergency-600 font-bold text-base mt-1" role="alert">
                ⚠️ {errors.age}
              </p>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: GENDER                                                 */}
        {/* ============================================================== */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className={`font-black text-slate-900 dark:text-white ${assistedMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
                {t('register.step3Title')} <span className="text-emergency-600">*</span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-1 font-medium">
                {t('register.step3Desc')}
              </p>
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2"
              role="radiogroup"
              aria-label={t('register.step3Title')}
            >
              {[
                { id: 'female', labelKey: 'register.genderFemale' },
                { id: 'male', labelKey: 'register.genderMale' },
                { id: 'other', labelKey: 'register.genderOther' },
              ].map((g) => {
                const isSelected = draft.gender === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      setDraft((prev) => ({ ...prev, gender: g.id }));
                      if (errors.gender) setErrors((prev) => ({ ...prev, gender: null }));
                    }}
                    className={`min-h-[64px] px-4 py-3 rounded-2xl border-3 font-black text-lg sm:text-xl flex items-center justify-center gap-3 transition-all focus:ring-4 focus:ring-hospital-400 focus:outline-none ${
                      isSelected
                        ? 'bg-hospital-600 text-white border-hospital-700 shadow-md ring-2 ring-hospital-400'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <UserIcon className="w-6 h-6 flex-shrink-0" />
                    <span>{t(g.labelKey)}</span>
                  </button>
                );
              })}
            </div>

            {errors.gender && (
              <p className="text-emergency-600 font-bold text-base mt-1" role="alert">
                ⚠️ {errors.gender}
              </p>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 4: MOBILE NUMBER (OPTIONAL, FOR ALERTS)                   */}
        {/* ============================================================== */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className={`font-black text-slate-900 dark:text-white ${assistedMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
                {t('register.step4Title')}
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-1 font-medium">
                {t('register.step4Desc')}
              </p>
            </div>

            <div className="relative">
              <label htmlFor="input-patient-mobile" className="sr-only">
                {t('register.step4Title')}
              </label>
              <input
                id="input-patient-mobile"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={draft.mobile}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setDraft((prev) => ({ ...prev, mobile: val }));
                  if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: null }));
                }}
                placeholder={t('register.mobilePlaceholder')}
                autoFocus
                className={`w-full min-h-[60px] px-4 text-xl sm:text-2xl rounded-2xl border-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-4 focus:ring-hospital-400 focus:outline-none ${
                  isSpeechSupported ? 'pr-16' : ''
                } ${errors.mobile ? 'border-emergency-500 bg-emergency-50/20' : 'border-slate-300 dark:border-slate-600'}`}
                aria-invalid={errors.mobile ? 'true' : 'false'}
              />

              {/* Big microphone button using Web Speech API (hide if unsupported) */}
              {isSpeechSupported && (
                <button
                  type="button"
                  id="mic-btn-mobile"
                  onClick={() => toggleListening('mobile')}
                  className={`absolute right-2 top-2 bottom-2 w-12 rounded-xl flex items-center justify-center transition-all focus:ring-4 focus:ring-hospital-400 focus:outline-none ${
                    listeningField === 'mobile'
                      ? 'bg-emergency-600 text-white animate-pulse ring-4 ring-emergency-300'
                      : 'bg-hospital-100 hover:bg-hospital-200 dark:bg-hospital-900/60 text-hospital-700 dark:text-hospital-300'
                  }`}
                  aria-label={listeningField === 'mobile' ? t('register.micStop') : t('register.micListen')}
                  title={listeningField === 'mobile' ? t('register.micStop') : t('register.micListen')}
                >
                  <MicIcon className="w-6 h-6" isListening={listeningField === 'mobile'} />
                </button>
              )}
            </div>

            {listeningField === 'mobile' && (
              <p className="text-emergency-600 dark:text-emergency-400 font-bold text-sm sm:text-base flex items-center gap-1.5 animate-pulse">
                <span className="w-3 h-3 rounded-full bg-emergency-600"></span>
                <span>{t('register.micListening')}</span>
              </p>
            )}

            {errors.mobile && (
              <p className="text-emergency-600 font-bold text-base mt-1" role="alert">
                ⚠️ {errors.mobile}
              </p>
            )}

            {/* Privacy Guarantee: NEVER ask for Aadhaar or ABHA */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 p-4 rounded-2xl flex items-start gap-3 text-emerald-950 dark:text-emerald-200">
              <CheckCircleIcon className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="font-bold text-base sm:text-lg leading-relaxed">
                {t('register.privacyGuarantee')}
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 5: WHICH DOCTOR DO YOU NEED? (PICTURE CARDS)              */}
        {/* ============================================================== */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className={`font-black text-slate-900 dark:text-white ${assistedMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
                {t('register.step5Title')} <span className="text-emergency-600">*</span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-1 font-medium">
                {t('register.step5Desc')}
              </p>
            </div>

            {/* Picture cards (inline SVG icons) in plain words */}
            <div
              className="grid grid-cols-1 gap-3 pt-2"
              role="radiogroup"
              aria-label={t('register.step5Title')}
            >
              {doctorCards.map((doc) => {
                const isSelected = draft.deptId === doc.id;
                const DocIcon = doc.Icon;

                return (
                  <div
                    key={doc.id}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => {
                      setDraft((prev) => ({ ...prev, deptId: doc.id }));
                      if (errors.deptId) setErrors((prev) => ({ ...prev, deptId: null }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        setDraft((prev) => ({ ...prev, deptId: doc.id }));
                        if (errors.deptId) setErrors((prev) => ({ ...prev, deptId: null }));
                      }
                    }}
                    className={`p-4 rounded-2xl border-3 cursor-pointer transition-all flex items-start gap-4 focus:ring-4 focus:ring-hospital-400 focus:outline-none ${
                      isSelected
                        ? `bg-white dark:bg-slate-900 ${doc.activeRing} shadow-lg`
                        : `${doc.color} hover:shadow-md`
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700">
                      <DocIcon className="w-9 h-9" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-tight">
                          {t(doc.titleKey)}
                        </h3>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'border-hospital-600 bg-hospital-600' : 'border-slate-400 bg-white'
                          }`}
                        >
                          {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-white"></span>}
                        </div>
                      </div>

                      {/* Plain words symptoms in quotes */}
                      <p className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-200 mt-1">
                        "{t(doc.plainKey)}"
                      </p>

                      <p className="text-xs sm:text-sm text-hospital-700 dark:text-hospital-300 font-semibold mt-1">
                        {doc.room}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {errors.deptId && (
              <p className="text-emergency-600 font-bold text-base mt-1" role="alert">
                ⚠️ {errors.deptId}
              </p>
            )}

            {/* "Not sure? Ask at the help desk" that shows the route to the help desk */}
            <div className="pt-2">
              <button
                type="button"
                id="btn-help-desk-route"
                onClick={() => setHelpDeskModalOpen(true)}
                className="w-full min-h-[52px] p-3.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-900 dark:text-blue-200 border-2 border-blue-300 dark:border-blue-700 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-sm focus:ring-4 focus:ring-blue-400 focus:outline-none"
              >
                <MapPinIcon className="w-6 h-6 text-blue-600" />
                <span>{t('register.notSureHelpDesk')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons: Back button (keeps draft) & Next / Finish button */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          {/* Back button */}
          <button
            type="button"
            id="btn-wizard-back"
            onClick={handleBack}
            className="flex-1 min-h-[56px] py-3.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-extrabold text-lg sm:text-xl rounded-2xl flex items-center justify-center gap-2 border-2 border-slate-300 dark:border-slate-600 focus:ring-4 focus:ring-hospital-400 focus:outline-none transition-transform active:scale-95"
          >
            <ArrowLeftIcon className="w-6 h-6" />
            <span>{t('register.backBtn')}</span>
          </button>

          {/* Next / Finish button */}
          {step < 5 ? (
            <button
              type="button"
              id="btn-wizard-next"
              onClick={handleNext}
              className="flex-1 min-h-[56px] py-3.5 px-4 bg-hospital-600 hover:bg-hospital-700 active:bg-hospital-800 text-white font-extrabold text-lg sm:text-xl rounded-2xl flex items-center justify-center gap-2 shadow-lg focus:ring-4 focus:ring-amber-300 focus:outline-none transition-transform active:scale-95"
            >
              <span>{t('register.nextBtn')}</span>
              <ArrowRightIcon className="w-6 h-6" />
            </button>
          ) : (
            <button
              type="button"
              id="btn-wizard-finish"
              onClick={handleFinish}
              className="flex-1 min-h-[56px] py-3.5 px-4 bg-hospital-600 hover:bg-hospital-700 active:bg-hospital-800 text-white font-extrabold text-lg sm:text-xl rounded-2xl flex items-center justify-center gap-2 shadow-xl focus:ring-4 focus:ring-amber-300 focus:outline-none transition-transform active:scale-95"
            >
              <span>{t('register.finishBtn')}</span>
              <CheckCircleIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Modal / Dialog: Route to Help Desk */}
      {helpDeskModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-desk-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
        >
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-4 border-blue-500 rounded-3xl shadow-2xl overflow-hidden my-4 space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                  <MapPinIcon className="w-6 h-6" />
                </div>
                <h3 id="help-desk-dialog-title" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {t('register.helpDeskModalTitle')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHelpDeskModalOpen(false)}
                className="min-h-[44px] min-w-[44px] p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl flex items-center justify-center focus:ring-4 focus:ring-blue-400 focus:outline-none"
                aria-label="Close"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 p-4 rounded-2xl space-y-2">
                <span className="font-extrabold text-base sm:text-lg text-blue-950 dark:text-blue-100 block">
                  📍 {t('register.helpDeskLocation')}
                </span>
                <p className="text-base text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {t('register.helpDeskModalDesc')}
                </p>
              </div>

              {/* Turn-by-turn guidance */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                <p>1. Start at Main Entrance Gate 1 (Ground Floor).</p>
                <p>2. Walk straight ahead 15 meters along the central corridor.</p>
                <p>3. Registration Counters 1 to 4 are right on your right side.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setHelpDeskModalOpen(false);
                    navigate('/find?dest=reg_desk');
                  }}
                  className="flex-1 min-h-[50px] py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base sm:text-lg rounded-xl flex items-center justify-center gap-2 shadow-md focus:ring-4 focus:ring-blue-300 focus:outline-none"
                >
                  <MapPinIcon className="w-5 h-5" />
                  <span>{t('register.helpDeskShowMap')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHelpDeskModalOpen(false)}
                  className="flex-1 min-h-[50px] py-3 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-base sm:text-lg rounded-xl flex items-center justify-center focus:ring-4 focus:ring-slate-400 focus:outline-none"
                >
                  <span>{t('register.helpDeskClose')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../context/I18nContext.jsx';
import { useHospital } from '../context/HospitalContext.jsx';
import { DEPARTMENTS } from '../data/departments.js';
import {
  TicketIcon,
  UserIcon,
  CheckCircleIcon,
  InfoIcon,
  RampIcon,
  ElevatorIcon,
  StethoscopeIcon,
  BoneIcon,
  EyeIcon,
  ClockIcon,
} from '../components/common/Icons.jsx';

export default function RegistrationPage() {
  const { t } = useI18n();
  const { registerPatient } = useHospital();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('female');
  const [selectedDeptId, setSelectedDeptId] = useState('ortho'); // Default to Orthopaedics for Kamla
  const [avoidStairs, setAvoidStairs] = useState(true); // Default true for elderly comfort
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = t('reg.errorName');
    if (!age || isNaN(age) || Number(age) <= 0 || Number(age) > 125) {
      errs.age = t('reg.errorAge');
    }
    if (!selectedDeptId) errs.dept = t('reg.errorDept');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newToken = registerPatient({
      name,
      age,
      gender,
      deptId: selectedDeptId,
      avoidStairs,
    });

    navigate(`/slip/${newToken.tokenCode}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-8" noValidate>
      {/* Title */}
      <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-3">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <TicketIcon className="w-8 h-8 text-hospital-600 dark:text-hospital-400" />
          <span>{t('reg.title')}</span>
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-1">
          {t('def.opd')}
        </p>
      </div>

      {/* Step 1: Patient Information */}
      <section className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <h3 className="text-xl sm:text-2xl font-bold text-hospital-900 dark:text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-hospital-100 dark:bg-hospital-900 text-hospital-700 dark:text-hospital-300 flex items-center justify-center font-black text-lg">
            1
          </span>
          <span>{t('reg.step1Title')}</span>
        </h3>

        {/* Patient Name Input */}
        <div>
          <label htmlFor="patient-name" className="block font-bold text-lg text-slate-800 dark:text-slate-200 mb-1">
            {t('reg.nameLabel')} <span className="text-emergency-600">*</span>
          </label>
          <input
            id="patient-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('reg.namePlaceholder')}
            className={`w-full min-h-[56px] px-4 text-lg sm:text-xl rounded-xl border-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-4 focus:ring-hospital-400 focus:outline-none ${
              errors.name ? 'border-emergency-500' : 'border-slate-300 dark:border-slate-600'
            }`}
            aria-required="true"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby="name-help"
          />
          <p id="name-help" className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            {t('reg.nameHelp')}
          </p>
          {errors.name && (
            <p className="text-emergency-600 font-bold text-base mt-1" role="alert">
              ⚠️ {errors.name}
            </p>
          )}
        </div>

        {/* Age and Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="patient-age" className="block font-bold text-lg text-slate-800 dark:text-slate-200 mb-1">
              {t('reg.ageLabel')} <span className="text-emergency-600">*</span>
            </label>
            <input
              id="patient-age"
              type="number"
              inputMode="numeric"
              min="1"
              max="125"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder={t('reg.agePlaceholder')}
              className={`w-full min-h-[56px] px-4 text-lg sm:text-xl rounded-xl border-2 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-4 focus:ring-hospital-400 focus:outline-none ${
                errors.age ? 'border-emergency-500' : 'border-slate-300 dark:border-slate-600'
              }`}
              aria-required="true"
              aria-invalid={errors.age ? 'true' : 'false'}
            />
            {errors.age && (
              <p className="text-emergency-600 font-bold text-base mt-1" role="alert">
                ⚠️ {errors.age}
              </p>
            )}
          </div>

          <div>
            <span className="block font-bold text-lg text-slate-800 dark:text-slate-200 mb-1">
              {t('reg.genderLabel')}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {['female', 'male', 'other'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`min-h-[56px] px-2 rounded-xl border-2 font-bold text-base flex items-center justify-center focus:ring-4 focus:ring-hospital-400 focus:outline-none ${
                    gender === g
                      ? 'bg-hospital-600 text-white border-hospital-700 shadow'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                  }`}
                  aria-pressed={gender === g}
                >
                  {g === 'female' ? t('reg.genderFemale') : g === 'male' ? t('reg.genderMale') : t('reg.genderOther')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Safety & Privacy Notice (Rule 4: Never ask for Aadhaar or ABHA) */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 p-3.5 rounded-xl flex items-start gap-2.5 text-emerald-900 dark:text-emerald-200">
          <CheckCircleIcon className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="font-semibold text-base sm:text-lg">
            {t('reg.privacyNotice')}
          </p>
        </div>
      </section>

      {/* Step 2: Choose Doctor Clinic (Department) */}
      <section className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <h3 className="text-xl sm:text-2xl font-bold text-hospital-900 dark:text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-hospital-100 dark:bg-hospital-900 text-hospital-700 dark:text-hospital-300 flex items-center justify-center font-black text-lg">
            2
          </span>
          <span>{t('reg.step2Title')}</span>
        </h3>
        <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 font-medium">
          {t('reg.deptHelp')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Department selection">
          {DEPARTMENTS.map((dept) => {
            const isSelected = selectedDeptId === dept.id;
            return (
              <div
                key={dept.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => setSelectedDeptId(dept.id)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setSelectedDeptId(dept.id);
                  }
                }}
                className={`p-4 rounded-xl border-3 cursor-pointer transition-all focus:ring-4 focus:ring-hospital-400 focus:outline-none ${
                  isSelected
                    ? 'border-hospital-600 bg-hospital-50 dark:bg-hospital-950/80 shadow-md ring-2 ring-hospital-500'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-slate-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                      {t(dept.nameKey)}
                    </h4>
                    <p className="text-sm sm:text-base font-bold text-hospital-700 dark:text-hospital-300 mt-0.5">
                      {t(dept.floorKey)} • Room {dept.room} • {dept.doctorName}
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                      isSelected ? 'border-hospital-600 bg-hospital-600' : 'border-slate-400 bg-white'
                    }`}
                  >
                    {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-white"></span>}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">Common symptoms: </span>
                  {t(dept.symptomsKey)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Step 3: Walking Comfort & Accessibility (Kamla's priority!) */}
      <section className="bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
        <h3 className="text-xl sm:text-2xl font-bold text-hospital-900 dark:text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-hospital-100 dark:bg-hospital-900 text-hospital-700 dark:text-hospital-300 flex items-center justify-center font-black text-lg">
            3
          </span>
          <span>{t('reg.step3Title')}</span>
        </h3>

        <label
          htmlFor="avoid-stairs-checkbox"
          className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 rounded-xl cursor-pointer hover:bg-amber-100/60"
        >
          <input
            id="avoid-stairs-checkbox"
            type="checkbox"
            checked={avoidStairs}
            onChange={(e) => setAvoidStairs(e.target.checked)}
            className="w-7 h-7 text-hospital-600 rounded border-2 border-slate-400 focus:ring-4 focus:ring-hospital-400 mt-0.5 flex-shrink-0"
          />
          <div>
            <span className="font-extrabold text-lg sm:text-xl text-amber-950 dark:text-amber-100 block">
              {t('reg.avoidStairsLabel')}
            </span>
            <span className="text-base text-amber-900 dark:text-amber-200 mt-1 block font-medium">
              {t('reg.avoidStairsDesc')}
            </span>
            <div className="flex items-center gap-4 mt-2 text-sm font-bold text-amber-900 dark:text-amber-200">
              <span className="flex items-center gap-1">
                <ElevatorIcon className="w-5 h-5 text-hospital-600" />
                <span>Elevator / Lift</span>
              </span>
              <span className="flex items-center gap-1">
                <RampIcon className="w-5 h-5 text-emerald-600" />
                <span>Gentle Ramp</span>
              </span>
            </div>
          </div>
        </label>
      </section>

      {/* Submit Action */}
      <div>
        <button
          id="btn-submit-registration"
          type="submit"
          className="w-full min-h-[56px] py-4 px-6 bg-hospital-600 hover:bg-hospital-700 active:bg-hospital-800 text-white font-extrabold text-xl sm:text-2xl rounded-2xl flex items-center justify-center gap-3 shadow-xl focus:ring-4 focus:ring-amber-300 focus:outline-none transition-transform active:scale-95"
        >
          <TicketIcon className="w-8 h-8" />
          <span>{t('reg.submitBtn')}</span>
        </button>
      </div>
    </form>
  );
}

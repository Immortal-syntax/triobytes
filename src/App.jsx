import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { I18nProvider } from './context/I18nContext.jsx';
import { AccessibilityProvider } from './context/AccessibilityContext.jsx';
import { HospitalProvider } from './context/HospitalContext.jsx';

import EmergencyBar from './components/common/EmergencyBar.jsx';
import EmergencyModal from './components/common/EmergencyModal.jsx';
import UrgentHelpModal from './components/common/UrgentHelpModal.jsx';
import AccessibilityHeader from './components/common/AccessibilityHeader.jsx';
import NavBar from './components/common/NavBar.jsx';

import HomePage from './pages/HomePage.jsx';
import RegistrationPage from './pages/RegistrationPage.jsx';
import OpdSlipPage from './pages/OpdSlipPage.jsx';
import QueueTrackerPage from './pages/QueueTrackerPage.jsx';
import HospitalMapPage from './pages/HospitalMapPage.jsx';
import StaffDashboardPage from './pages/StaffDashboardPage.jsx';
import TvDisplayPage from './pages/TvDisplayPage.jsx';

export default function App() {
  return (
    <I18nProvider>
      <AccessibilityProvider>
        <HospitalProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
            {/* SAFETY RULE 1: Emergency bar visible on EVERY screen */}
            <EmergencyBar />

            {/* Top Accessibility & Language Header */}
            <AccessibilityHeader />

            {/* Main Application Content */}
            <main id="main-content" className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegistrationPage />} />
                <Route path="/slip" element={<OpdSlipPage />} />
                <Route path="/queue" element={<QueueTrackerPage />} />
                <Route path="/map" element={<HospitalMapPage />} />
                <Route path="/staff" element={<StaffDashboardPage />} />
                <Route path="/display" element={<TvDisplayPage />} />
              </Routes>
            </main>

            {/* Accessible Navigation Bar */}
            <NavBar />

            {/* Global Overlays */}
            <EmergencyModal />
            <UrgentHelpModal />
          </div>
        </HospitalProvider>
      </AccessibilityProvider>
    </I18nProvider>
  );
}

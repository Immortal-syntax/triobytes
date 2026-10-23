import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { HospitalProvider } from './context/HospitalContext.jsx';
import PatientLayout from './components/layout/PatientLayout.jsx';

// Pages
import HomePage from './pages/HomePage.jsx';
import RegistrationPage from './pages/RegistrationPage.jsx';
import OpdSlipTokenPage from './pages/OpdSlipTokenPage.jsx';
import TurnTrackerPage from './pages/TurnTrackerPage.jsx';
import HaveSlipPage from './pages/HaveSlipPage.jsx';
import FindPlacePage from './pages/FindPlacePage.jsx';
import EmergencyPage from './pages/EmergencyPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import StaffDashboardPage from './pages/StaffDashboardPage.jsx';
import StaffCounterPage from './pages/StaffCounterPage.jsx';
import TvDisplayPage from './pages/TvDisplayPage.jsx';

// Global Modals
import EmergencyModal from './components/common/EmergencyModal.jsx';
import UrgentHelpModal from './components/common/UrgentHelpModal.jsx';

export default function App() {
  return (
    <SettingsProvider>
      <HospitalProvider>
        <PatientLayout>
          <Routes>
            {/* Exact Required Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/slip/:token" element={<OpdSlipTokenPage />} />
            <Route path="/slip" element={<Navigate to="/have-slip" replace />} />
            <Route path="/turn/:token" element={<TurnTrackerPage />} />
            <Route path="/have-slip" element={<HaveSlipPage />} />
            <Route path="/find" element={<FindPlacePage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/staff" element={<StaffDashboardPage />} />
            <Route path="/staff/counter" element={<StaffCounterPage />} />
            <Route path="/board" element={<TvDisplayPage />} />

            {/* Backwards compatibility aliases */}
            <Route path="/queue" element={<Navigate to="/turn/ORTHO-14" replace />} />
            <Route path="/map" element={<Navigate to="/find" replace />} />
            <Route path="/display" element={<Navigate to="/board" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PatientLayout>

        {/* Global Action Modals */}
        <EmergencyModal />
        <UrgentHelpModal />
      </HospitalProvider>
    </SettingsProvider>
  );
}

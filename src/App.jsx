import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider }     from './context/UserContext';
import { ThemeProvider }    from './pages/Themecontext';
import { LanguageProvider } from './context/LanguageContext';

// ── Global responsive styles ──
import './responsive.css';

import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome   from './pages/DashboardHome';
import UploadECG       from './pages/UploadECG';
import Settings        from './pages/Settings';
import AboutUs         from './pages/Aboutus';
import HelpSupport     from './pages/Helpsupport';
import Profile         from './pages/UserProfile';
import LoginSignup     from './pages/LoginSignup';
import UserInfo        from './pages/UserInfo';

export default function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <LanguageProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/"           element={<LoginSignup />} />
              <Route path="/onboarding" element={<UserInfo />} />
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardHome />} />
                <Route path="/upload"    element={<UploadECG />} />
                <Route path="/settings"  element={<Settings />} />
                <Route path="/about"     element={<AboutUs />} />
                <Route path="/support"   element={<HelpSupport />} />
                <Route path="/profile"   element={<Profile />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
    </UserProvider>
  );
}
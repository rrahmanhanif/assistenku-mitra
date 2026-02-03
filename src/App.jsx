// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { runDeviceFraudChecks } from "./lib/fraudSignals";
import { request } from "./shared/httpClient";

// Pages
import DashboardMitra from "./pages/DashboardMitra";
import OrderDetail from "./pages/OrderDetail";
import Chat from "./pages/Chat";
import History from "./pages/History";
import Rating from "./pages/Rating";
import Withdraw from "./pages/Withdraw";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import MitraLogin from "./pages/MitraLogin";
import MitraRegister from "./pages/MitraRegister";
import MitraForgotPassword from "./pages/MitraForgotPassword";
import MitraResetPassword from "./pages/MitraResetPassword";

// Modules
import { startMitraGPS } from "./modules/liveLocation";
import LocationRationaleDialog from "./components/LocationRationaleDialog";
import {
  hasLocationConsent,
  recordLocationConsent,
} from "./modules/locationConsent";

export default function App() {
  const [locationConsent, setLocationConsent] = useState(hasLocationConsent());
  const [showLocationRationale, setShowLocationRationale] = useState(
    !hasLocationConsent()
  );
  const [authChecked, setAuthChecked] = useState(false);

  const handleApproveLocation = () => {
    recordLocationConsent();
    setLocationConsent(true);
    setShowLocationRationale(false);
  };

  // =====================================
  // START LIVE GPS (MITRA)
  // =====================================
  useEffect(() => {
    if (!locationConsent) return;

    const stop = startMitraGPS?.();
    return () => {
      try {
        if (typeof stop === "function") stop();
      } catch (_) {}
    };
  }, [locationConsent]);

  // =====================================
  // AUTH GATE + FRAUD SIGNALS
  // =====================================
  useEffect(() => {
    let active = true;

    async function checkAuthAndFraud() {
      try {
        const response = await request("/api/auth/whoami");
        const profile = response.data || {};
        const roles = profile.roles || profile.role || profile.user?.roles;

        const hasMitraRole = Array.isArray(roles)
          ? roles.includes("MITRA")
          : roles === "MITRA";

        if (!hasMitraRole) {
          window.location.href = "/mitra-login";
          return;
        }

        if (profile.id) {
          runDeviceFraudChecks(profile.id);
        }
      } catch (_) {
        window.location.href = "/mitra-login";
        return;
      } finally {
        if (active) setAuthChecked(true);
      }
    }

    checkAuthAndFraud();

    return () => {
      active = false;
    };
  }, []);

  // =====================================
  // ROUTES MITRA
  // =====================================
  if (!authChecked) {
    return <div className="p-5 text-sm text-slate-500">Memuat sesi...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/mitra-login" element={<MitraLogin />} />
        <Route path="/mitra-register" element={<MitraRegister />} />
        <Route path="/mitra-forgot" element={<MitraForgotPassword />} />
        <Route path="/mitra-reset" element={<MitraResetPassword />} />

        <Route path="/" element={<DashboardMitra />} />
        <Route path="/order/:id" element={<OrderDetail />} />
        <Route path="/chat/:orderId" element={<Chat />} />
        <Route path="/history" element={<History />} />
        <Route path="/rating" element={<Rating />} />
        <Route path="/withdraw" element={<Withdraw />} />

        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Routes>

      {showLocationRationale && (
        <LocationRationaleDialog
          onAccept={handleApproveLocation}
          onDecline={() => setShowLocationRationale(false)}
        />
      )}
    </Router>
  );
}

// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import supabase from "./lib/supabaseClient";
import { runDeviceFraudChecks } from "./lib/fraudSignals";

// Pages
import DashboardMitra from "./pages/DashboardMitra";
import OrderDetail from "./pages/OrderDetail";
import Chat from "./pages/Chat";
import History from "./pages/History";
import Rating from "./pages/Rating";
import Withdraw from "./pages/Withdraw";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

// Modules
import { startMitraGPS } from "./modules/liveLocation";
import LocationRationaleDialog from "./components/LocationRationaleDialog";
import { hasLocationConsent, recordLocationConsent } from "./modules/locationConsent";

export default function App() {
  const [locationConsent, setLocationConsent] = useState(hasLocationConsent());
  const [showLocationRationale, setShowLocationRationale] = useState(
    !hasLocationConsent()
  );

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
  // FRAUD SIGNALS — ROOT/JAILBREAK
  // =====================================
  useEffect(() => {
    async function checkFraudSignals() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      runDeviceFraudChecks(user.id);
    }

    checkFraudSignals();
  }, []);

  // =====================================
  // ROUTES MITRA
  // =====================================
  return (
    <Router>
      <Routes>
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
